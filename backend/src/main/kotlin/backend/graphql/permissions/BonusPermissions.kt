package backend.graphql.permissions

import backend.award.Award
import backend.award.AwardRepository
import backend.award.AwardType
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.chestAward.ChestAwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistory
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.graphql.utils.PhotoAssigner
import backend.groups.GroupsRepository
import backend.graphql.utils.Permission
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getBooleanField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getLongList
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class BonusPermissions {

    @Autowired
    private lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    private lateinit var pointsRepository: PointsRepository

    @Autowired
    private lateinit var chestAwardRepository: ChestAwardRepository

    @Autowired
    private lateinit var groupsRepository: GroupsRepository

    @Autowired
    private lateinit var editionRepository: EditionRepository

    @Autowired
    private lateinit var bonusesRepository: BonusesRepository

    @Autowired
    private lateinit var awardEditionRepository: AwardEditionRepository

    @Autowired
    private lateinit var awardRepository: AwardRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var chestsRepository: ChestsRepository

    @Autowired
    private lateinit var chestEditionRepository: ChestEditionRepository

    @Autowired
    private lateinit var chestHistoryRepository: ChestHistoryRepository

    @Autowired
    private lateinit var photoAssigner: PhotoAssigner

    fun checkAddBonusPermission(arguments: JsonNode): Permission {
        val action = "addBonus"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.STUDENT && currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko studenci (oraz koordynatorzy) mogą otwierać skrzynki"
            )
        }

        val chestHistoryId = arguments.getLongField("chestHistoryId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'chestHistoryId'"
        )

        val awardIds = arguments.getLongList("awardIds") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardIds'"
        )

        val checkDates = arguments.getBooleanField("checkDates") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'checkDates'"
        )

        val chestHistory = chestHistoryRepository.findById(chestHistoryId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono chestHistory o id $chestHistoryId"
            )

        if (currentUser.role != UsersRoles.COORDINATOR && chestHistory.user.userId != currentUser.userId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Możesz otwierać tylko swoje skrzynki"
            )
        }

        if (chestHistory.opened) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Skrzynka została już otwarta"
            )
        }

        if (chestHistory.hasExistingBonus(bonusesRepository)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Bonus już istnieje dla danej skrzynki"
            )
        }

        val awards = awardIds.map { awardRepository.findById(it).orElse(null) }

        if (awards.any { it == null }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nieprawidłowy identyfikator Łupu"
            )
        }

        if (chestHistory.chest.awardBundleCount < awards.size) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nieprawidłowa liczba nagród - oczekiwano ${chestHistory.chest.awardBundleCount} lub mniej"
            )
        }

        val userEditions = groupsRepository.findByUserGroups_User_UserId(chestHistory.user.userId).map { it.edition }.toSet()

        awards.forEach { award ->
            if (award.maxUsages != -1 && chestHistory.user.getAwardUsageCount(award, bonusesRepository) >= award.maxUsages) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nie można przyznać więcej niż ${award.maxUsages} bonusów za ${award.awardName} (${award.awardId})"
                )
            }
            if (chestAwardRepository.findByChest(chestHistory.chest).none { it.award == award }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Łup ${award.awardName} (${award.awardId}) nie jest dostępny w skrzynce."
                )
            }
            val awardEditions = awardEditionRepository.findByAward(award).map { it.edition }.toSet()
            val commonEditions = userEditions.intersect(awardEditions)
            if (commonEditions.isEmpty()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Łup ${award.awardName} (${award.awardId}) nie jest dostępny w żadnej z edycji użytkownika."
                )
            }
            val edition = chestHistory.subcategory.edition ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Podkategoria ${chestHistory.subcategory} nie ma wybranej edycji"
            )
            if (checkDates){
                if (edition.startDate.isAfter(LocalDate.now())){
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "Edycja jeszcze się nie rozpoczęła"
                    )
                }
                if (edition.endDate.isBefore(LocalDate.now())){
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "Edycja już się zakończyła"
                    )
                }
            }
            val permission = when (award.awardType) {
                AwardType.ADDITIVE -> createAdditivePoints(chestHistory, award)
                AwardType.ADDITIVE_NEXT -> createAdditiveNextPoints(chestHistory, award, edition)
                AwardType.ADDITIVE_PREV -> createAdditivePrevPoints(chestHistory, award, edition)
                AwardType.MULTIPLICATIVE -> createMultiplicativePoints(chestHistory, award, edition)
            }
            if (!permission.allow) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = permission.reason
                )
            }
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    private fun getUserEditions(userId: Long): Set<Edition> {
        val userGroups = groupsRepository.findByUserGroups_User_UserId(userId)
        return userGroups.map { it.edition }.toSet()
    }

    private fun getAwardEditions(award: Award): Set<Edition> {
        return awardEditionRepository.findByAward(award).map { it.edition }.toSet()
    }

    private fun createAdditivePoints(chestHistory: ChestHistory, award: Award): Permission {
        val action = "createAdditivePoints"
        val arguments = objectMapper.valueToTree<JsonNode>(mapOf(
            "chestHistoryId" to chestHistory.chestHistoryId,
            "awardId" to award.awardId
        ))
        if (chestHistory.subcategory.edition == null){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Podkategoria ${chestHistory.subcategory} nie ma wybranej edycji"
            )
        }
        if (chestHistory.subcategory.edition?.editionId !in getAwardEditions(award).map { it.editionId }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Łup nie jest dostępny w edycji podkategorii"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }


    private fun checkCreateAdditivePointsPermission(chestHistory: ChestHistory, award: Award): Permission {
        val action = "createAdditivePoints"
        val arguments = objectMapper.valueToTree<JsonNode>(mapOf(
            "chestHistoryId" to chestHistory.chestHistoryId,
            "awardId" to award.awardId
        ))
        if (chestHistory.subcategory.edition == null){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Podkategoria ${chestHistory.subcategory} nie ma wybranej edycji"
            )
        }
        if (chestHistory.subcategory.edition?.editionId !in getAwardEditions(award).map { it.editionId }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Łup nie jest dostępny w edycji podkategorii"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    private fun createAdditiveNextPoints(chestHistory: ChestHistory, award: Award, edition: Edition): Permission {
        val action = "createAdditiveNextPoints"
        val arguments = objectMapper.valueToTree<JsonNode>(mapOf(
            "chestHistoryId" to chestHistory.chestHistoryId,
            "awardId" to award.awardId
        ))
        val pointsInAwardCategory = chestHistory.user.getPointsByEditionAndCategory(edition,
            award.category, pointsRepository).filter{
                point -> bonusesRepository.findByPoints(point).isEmpty()
        }

        val lastSubcategory = pointsInAwardCategory.maxByOrNull { it.subcategory.ordinalNumber }?.subcategory
        val nextSubcategory = if (lastSubcategory != null) {
            subcategoriesRepository.findFirstByCategoryAndEditionAndOrdinalNumberGreaterThanOrderByOrdinalNumberAsc(
                lastSubcategory.category, edition, lastSubcategory.ordinalNumber
            ).orElseGet {
                subcategoriesRepository.findFirstByCategoryAndEditionOrderByOrdinalNumberAsc(lastSubcategory.category, edition)
                    .orElse ( null )
            }
        } else {
            subcategoriesRepository.findFirstByCategoryAndEditionOrderByOrdinalNumberAsc(chestHistory.subcategory.category, edition)
                .orElse ( null )
        }
        if (nextSubcategory == null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono następnej podkategorii w określonej kategorii"
            )
        }

        if (chestHistory.user.getPointsBySubcategory(nextSubcategory.subcategoryId, pointsRepository).isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Punkty już istnieją w następnej podkategorii"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    private fun createAdditivePrevPoints(chestHistory: ChestHistory, award: Award, edition: Edition): Permission {
        val action = "createAdditivePrevPoints"
        val arguments = objectMapper.valueToTree<JsonNode>(mapOf(
            "chestHistoryId" to chestHistory.chestHistoryId,
            "awardId" to award.awardId
        ))
        val pointsInAwardCategory = chestHistory.user.getPointsByEditionAndCategory(edition,
            award.category, pointsRepository).filter{
                point -> bonusesRepository.findByPoints(point).isEmpty()
        }.sortedBy { it.subcategory.ordinalNumber }
        if (pointsInAwardCategory.isEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Brak poprzednich punktów w danej kategorii"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    private fun createMultiplicativePoints(chestHistory: ChestHistory, award: Award, edition: Edition): Permission {
        val action = "createMultiplicativePoints"
        val arguments = objectMapper.valueToTree<JsonNode>(mapOf(
            "chestHistoryId" to chestHistory.chestHistoryId,
            "awardId" to award.awardId
        ))
        val pointsInAwardCategory = chestHistory.user.getPointsByEditionAndCategory(edition,
            award.category, pointsRepository).filter{
                point -> bonusesRepository.findByPoints(point).isEmpty()  // discard points connected to bonuses
        }
        val totalPointsValue = pointsInAwardCategory.sumOf { it.value.toDouble() }.toFloat()

        val subcategory = subcategoriesRepository.findFirstByCategoryAndEditionOrderByOrdinalNumberAsc(
            award.category, edition
        ).orElse(null)

        if (subcategory == null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono podkategorii w określonej kategorii"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}