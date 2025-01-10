package backend.graphql.permissions

import backend.award.AwardRepository
import backend.awardEdition.AwardEdition
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.edition.EditionRepository
import backend.graphql.utils.Permission
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class AwardEditionPermissions {

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

    fun checkAddAwardToEditionPermission(arguments: JsonNode): Permission {
        val action = "addAwardToEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą dodać łupy do edycji"
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

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )

        if (edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }

        if (awardEditionRepository.existsByAward_AwardNameAndEdition(award.awardName, edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Łup o tej nazwie już istnieje w tej edycji"
            )
        }

        if (award.category.categoryEdition.none { it.edition == edition }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Kategoria łupu nie istnieje w tej edycji"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveAwardFromEditionPermission(arguments: JsonNode): Permission {
        val action = "removeAwardFromEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą usuwać nagrody z edycji"
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

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )

        if (!awardEditionRepository.existsByAwardAndEdition(award, edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Ten łup nie istnieje w podanej edycji"
            )
        }

        if (edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }

        if (bonusesRepository.existsByAwardAndPoints_Subcategory_Edition(award, edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Łup został już przypisany studentom w tej edycji"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }


    fun checkAddAwardToEditionHelperPermission(awardId: Long, editionId: Long): Permission {
        val action = "addAwardToEdition"
        val arguments = objectMapper.valueToTree<JsonNode>(
            mapOf(
                "awardId" to awardId,
                "editionId" to editionId
            )
        )
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą dodać łupy do edycji"
            )
        }

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono Łupu o id $awardId"
            )
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono Edycji o id $editionId"
            )
        if (awardEditionRepository.existsByAward_AwardNameAndEdition(award.awardName, edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Łup o tej nazwie już istnieje w tej edycji"
            )
        }

        if (award.category.categoryEdition.none { it.edition == edition }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Kategoria łupu nie istnieje w tej edycji"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveAwardFromEditionHelperPermission(awardId: Long, editionId: Long): Permission {
        val action = "removeAwardFromEditionHelper"
        val arguments = objectMapper.valueToTree<JsonNode>(
            mapOf(
                "awardId" to awardId,
                "editionId" to editionId
            )
        )
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą usuwać nagrody z edycji"
            )
        }

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono Łupu o id $awardId"
            )
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono Edycji o id $editionId"
            )
        if (!awardEditionRepository.existsByAwardAndEdition(award, edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Ten łup nie istnieje w podanej edycji"
            )
        }

        if (edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }

        if (bonusesRepository.existsByAwardAndPoints_Subcategory_Edition(award, edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Łup został już przypisany studentom w tej edycji"
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