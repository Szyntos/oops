package backend.graphql.partialPermissions

import backend.award.AwardRepository
import backend.award.AwardType
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.categories.CategoriesRepository
import backend.chestAward.ChestAwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.Permission
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getFloatField
import backend.utils.JsonNodeExtensions.getIntField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.RoundingMode
import java.time.LocalDate

@Service
class AwardsPartialPermissions {

    @Autowired
    private lateinit var chestAwardRepository: ChestAwardRepository

    @Autowired
    private lateinit var categoriesRepository: CategoriesRepository

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

    fun checkEditAwardPermission(arguments: JsonNode): Permission {
        val action = "editAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą edytować łupy"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardId'."
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono Łupu o id $awardId"
            )

        if (award.awardEditions.map { it.edition }.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja z tą łupem już się zakończyła"
            )
        }

        if (award.awardEditions.map { it.edition }.any { it.startDate.isBefore(java.time.LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja z tą łupem już wystartowała"
            )
        }

//        if (award.bonuses.isNotEmpty()){
//            return Permission(
//                action = action,
//                arguments = arguments,
//                allow = false,
//                reason = "Łup jest już w użyciu"
//            )
//        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveAwardPermission(arguments: JsonNode): Permission {
        val action = "removeAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą usuwać łupy"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardId'."
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono Łupu o id $awardId"
            )

        if (award.awardEditions.map { it.edition }.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja z tą łupem już się zakończyła"
            )
        }

        if (bonusesRepository.existsByAward(award)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Łup jest już w użyciu"
            )
        }

        val awardBundleCounts = chestAwardRepository.findAllByAward(award).map { Pair(it.chest.awardBundleCount, chestAwardRepository.findByChest(it.chest).size) }

        if (awardBundleCounts.any {it.first >= it.second}){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Usunięcie tego łupu spowoduje, że w niektórych skrzyniach maksymalna liczba możliwych do zdobycia przedmiotów przekroczy faktyczną liczbę dostępnych łupów"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkCopyAwardPermission(arguments: JsonNode): Permission {
        val action = "copyAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą kopiować łupy"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardId'."
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono Łupu o id $awardId"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}