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
import backend.groups.GroupsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.math.min

@DgsComponent
class BonusDataFetcher {

    @Autowired
    private lateinit var chestAwardRepository: ChestAwardRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    lateinit var bonusRepository: BonusesRepository

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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.STUDENT && currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only students (and a coordinator) can open chests.")
        }

        val chestHistory = chestHistoryRepository.findById(chestHistoryId)
            .orElseThrow { IllegalArgumentException("Invalid chest history ID") }


        if (chestHistory.hasExistingBonus(bonusRepository)) {
            throw IllegalArgumentException("Bonus already exists for the given chest history.")
        }

        if (chestHistory.opened) {
            throw IllegalArgumentException("Chest is already opened.")
        }

        val awards = awardIds.map { awardRepository.findById(it).orElseThrow { IllegalArgumentException("Invalid award ID") } }

        if (chestHistory.chest.awardBundleCount != awards.size) {
            throw IllegalArgumentException("Invalid number of awards.")
        }
        val userEditions = getUserEditions(chestHistory.user.userId)

        val savedBonuses = mutableListOf<AddBonusReturnType>()

        awards.forEach { award ->
            if (award.maxUsages != -1 && chestHistory.user.getAwardUsageCount(award, bonusRepository) >= award.maxUsages) {
                throw IllegalArgumentException("Cannot apply more than ${award.maxUsages} bonuses for ${award.awardName} (${award.awardId}).")
            }
            if (chestAwardRepository.findByChest(chestHistory.chest).none { it.award == award }) {
                throw IllegalArgumentException("Award ${award.awardName} (${award.awardId}) is not available in the chest.")
            }
            val awardEditions = getAwardEditions(award)
            val commonEditions = userEditions.intersect(awardEditions)
            if (commonEditions.isEmpty()) {
                throw IllegalArgumentException("User's edition is not in the award's editions.")
            }
            val edition = chestHistory.subcategory.edition ?: throw IllegalArgumentException("Subcategory's edition is not set.")
            if (checkDates){
                if (edition.startDate.isAfter(java.time.LocalDate.now())){
                    throw IllegalArgumentException("Edition has not started yet")
                }
                if (edition.endDate.isBefore(java.time.LocalDate.now())){
                    throw IllegalArgumentException("Edition has already ended")
                }
            }
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
            val savedBonus = bonusRepository.save(bonus)
            savedBonuses.add(AddBonusReturnType(savedBonus, savedPoints))
        }

        chestHistory.opened = true
        chestHistoryRepository.save(chestHistory)

        return savedBonuses
    }

    private fun getUserEditions(userId: Long): Set<Edition> {
        val userGroups = groupsRepository.findByUserGroups_User_UserId(userId)
        return userGroups.map { it.edition }.toSet()
    }

    private fun getAwardEditions(award: Award): Set<Edition> {
        return awardEditionRepository.findByAward(award).map { it.edition }.toSet()
    }

    private fun createAdditivePoints(chestHistory: ChestHistory, award: Award): Points {
        if (chestHistory.subcategory.edition == null){
            throw IllegalArgumentException("Subcategory's edition is not set.")
        }
        if (chestHistory.subcategory.edition?.editionId !in getAwardEditions(award).map { it.editionId }) {
            throw IllegalArgumentException("Subcategory's edition does not match the award's edition.")
        }

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
                point -> bonusRepository.findByPoints(point).isEmpty()  // discard points connected to bonuses
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

        if (chestHistory.user.getPointsBySubcategory(nextSubcategory.subcategoryId, pointsRepository).isNotEmpty()) {
            throw IllegalArgumentException("User already has points in the next subcategory.")
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
        val pointsInAwardCategory = chestHistory.user.getPointsByEditionAndCategory(edition,
            award.category, pointsRepository).filter{
                point -> bonusRepository.findByPoints(point).isEmpty()
        }.sortedBy { it.subcategory.ordinalNumber }
        if (pointsInAwardCategory.isEmpty()) {
            throw IllegalArgumentException("No previous points found in the specified category.")
        }

        var sum = 0f
        var i = pointsInAwardCategory.size - 1
        while (sum < award.awardValue.toFloat() && i >= 0) {
            val lastPoints = pointsInAwardCategory.getOrNull(i--)
                ?: break
            val pointsToAdd = min(award.awardValue.toFloat() - sum, lastPoints.subcategory.maxPoints.toFloat() - lastPoints.value.toFloat())
            sum += pointsToAdd
        }

        return Points(
            student = chestHistory.user,
            teacher = chestHistory.teacher,
            updatedBy = chestHistory.teacher,
            value = BigDecimal(sum.toString()).setScale(2, RoundingMode.HALF_UP),
            subcategory = pointsInAwardCategory.last().subcategory,
            label = "Points awarded for ${award.awardName}"
        )
    }

    private fun createMultiplicativePoints(chestHistory: ChestHistory, award: Award, edition: Edition): Points {
        val pointsInAwardCategory = chestHistory.user.getPointsByEditionAndCategory(edition,
            award.category, pointsRepository).filter{
                point -> bonusRepository.findByPoints(point).isEmpty()  // discard points connected to bonuses
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
