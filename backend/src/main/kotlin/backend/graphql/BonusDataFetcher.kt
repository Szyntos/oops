package backend.graphql

import backend.award.Award
import backend.points.Points
import backend.points.PointsRepository
import backend.chestHistory.ChestHistoryRepository
import backend.award.AwardRepository
import backend.award.AwardType
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.Bonuses
import backend.bonuses.BonusesRepository
import backend.chestAward.ChestAwardRepository
import backend.chestHistory.ChestHistory
import backend.edition.Edition
import backend.graphql.utils.PermissionDeniedException
import backend.graphql.utils.PermissionInput
import backend.graphql.utils.PermissionService
import backend.groups.GroupsRepository
import backend.subcategories.SubcategoriesRepository
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.math.max
import kotlin.math.min

@DgsComponent
class BonusDataFetcher {

    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    lateinit var bonusesRepository: BonusesRepository

    @Autowired
    lateinit var pointsRepository: PointsRepository

    @Autowired
    lateinit var chestHistoryRepository: ChestHistoryRepository

    @Autowired
    lateinit var awardRepository: AwardRepository

    @Autowired
    lateinit var awardEditionRepository: AwardEditionRepository

    @Autowired
    lateinit var groupsRepository: GroupsRepository

    @Autowired
    lateinit var subcategoriesRepository: SubcategoriesRepository

    @DgsMutation
    @Transactional
    fun addBonus(@InputArgument chestHistoryId: Long, @InputArgument awardIds: List<Long>,
                         @InputArgument checkDates: Boolean = true): List<AddBonusReturnType> {
        val action = "addBonus"
        val arguments = mapOf(
            "chestHistoryId" to chestHistoryId,
            "awardIds" to awardIds,
            "checkDates" to checkDates
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val chestHistory = chestHistoryRepository.findById(chestHistoryId)
            .orElseThrow { IllegalArgumentException("Invalid chest history ID") }

        val awards = awardIds.map { awardRepository.findById(it).orElseThrow { IllegalArgumentException("Invalid award ID") } }

        val savedBonuses = mutableListOf<AddBonusReturnType>()

        awards.forEach { award ->
            val edition = chestHistory.subcategory.edition ?: throw IllegalArgumentException("Subcategory's edition is not set.")

            val points = when (award.awardType) {
                AwardType.ADDITIVE -> createAdditivePoints(chestHistory, award)
                AwardType.ADDITIVE_NEXT -> createAdditiveNextPoints(chestHistory, award, edition)
                AwardType.ADDITIVE_PREV -> createAdditivePrevPoints(chestHistory, award, edition)
                AwardType.MULTIPLICATIVE -> createMultiplicativePoints(chestHistory, award, edition)
            }

            val savedPoints = pointsRepository.save(points)
            val bonus = Bonuses(
                points = savedPoints,
                award = award,
                chestHistory = chestHistory,
                label = ""
            )
            val savedBonus = bonusesRepository.save(bonus)
            savedBonuses.add(AddBonusReturnType(savedBonus, savedPoints))
        }

        chestHistory.opened = true
        chestHistoryRepository.save(chestHistory)

        return savedBonuses
    }

    private fun createAdditivePoints(chestHistory: ChestHistory, award: Award): Points {
        return Points(
            student = chestHistory.user,
            teacher = chestHistory.teacher,
            updatedBy = chestHistory.teacher,
            value = award.awardValue,
            subcategory = chestHistory.subcategory,
            label = "Points awarded for ${award.awardName}"
        )
    }

    private fun createAdditiveNextPoints(chestHistory: ChestHistory, award: Award, edition: Edition): Points {
        val pointsInAwardCategory = chestHistory.user.getPointsByEditionAndCategory(edition,
            award.category, pointsRepository).filter{
                point -> bonusesRepository.findByPoints(point).isEmpty()  // discard points connected to bonuses
            }

        val lastSubcategory = pointsInAwardCategory.maxByOrNull { it.subcategory.ordinalNumber }?.subcategory
        val nextSubcategory = if (lastSubcategory != null) {
            subcategoriesRepository.findFirstByCategoryAndEditionAndOrdinalNumberGreaterThanOrderByOrdinalNumberAsc(
                lastSubcategory.category, edition, lastSubcategory.ordinalNumber
            ).orElseGet {
                subcategoriesRepository.findFirstByCategoryAndEditionOrderByOrdinalNumberAsc(lastSubcategory.category, edition)
                    .orElseThrow { IllegalArgumentException("No subcategory found in the specified category.") }
            }
        } else {
            subcategoriesRepository.findFirstByCategoryAndEditionOrderByOrdinalNumberAsc(chestHistory.subcategory.category, edition)
                .orElseThrow { IllegalArgumentException("No subcategory found in the specified category.") }
        }

        return Points(
            student = chestHistory.user,
            teacher = chestHistory.teacher,
            updatedBy = chestHistory.teacher,
            value = min(award.awardValue.toFloat(), nextSubcategory.maxPoints.toFloat()).toBigDecimal().setScale(2, RoundingMode.HALF_UP),
            subcategory = nextSubcategory,
            label = "Points awarded for ${award.awardName}"
        )
    }

    private fun createAdditivePrevPoints(chestHistory: ChestHistory, award: Award, edition: Edition): Points {
        val pointsInAwardCategory = chestHistory.user.getPointsByEditionAndCategory(edition, award.category, pointsRepository)
            .sortedBy { it.subcategory.ordinalNumber }
            .filter { point -> bonusesRepository.findByPoints(point).isEmpty() || point.bonuses?.award?.awardType == AwardType.ADDITIVE_PREV }


        val sumOfAllPointsInAwardCategory = pointsInAwardCategory.sumOf { it.value.toDouble() }.toFloat()

        val allSubcategoriesInAwardCategory = subcategoriesRepository.findAllByCategoryAndEdition(award.category, edition)

        val maxPoints = allSubcategoriesInAwardCategory.sumOf { it.maxPoints.toDouble() }.toFloat()

        val freeSpace = maxPoints - sumOfAllPointsInAwardCategory

        val pointsToAdd = max(min(award.awardValue.toFloat(), freeSpace), 0f)

        return Points(
            student = chestHistory.user,
            teacher = chestHistory.teacher,
            updatedBy = chestHistory.teacher,
            value = pointsToAdd.toBigDecimal().setScale(2, RoundingMode.HALF_UP),
            subcategory = pointsInAwardCategory.first().subcategory,
            label = "Points awarded for ${award.awardName}"
        )
    }

    private fun createMultiplicativePoints(chestHistory: ChestHistory, award: Award, edition: Edition): Points {
        val pointsInAwardCategory = chestHistory.user.getPointsByEditionAndCategory(edition,
            award.category, pointsRepository).filter{
                point -> bonusesRepository.findByPoints(point).isEmpty()
        }
        val totalPointsValue = pointsInAwardCategory.sumOf { it.value.toDouble() }.toFloat()

        val subcategory = subcategoriesRepository.findFirstByCategoryAndEditionOrderByOrdinalNumberAsc(
            award.category, edition
        ).orElseThrow { IllegalArgumentException("No subcategory found in the specified category.") }

        return Points(
            student = chestHistory.user,
            teacher = chestHistory.teacher,
            updatedBy = chestHistory.teacher,
            value = (totalPointsValue * award.awardValue.toFloat()).toBigDecimal().setScale(2, RoundingMode.HALF_UP),
            subcategory = subcategory,
            label = "Points awarded for ${award.awardName}"
        )
    }
}

data class AddBonusReturnType(
    val bonus: Bonuses,
    val points: Points
)
