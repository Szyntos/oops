package backend.graphql.permissions

import backend.award.AwardRepository
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.edition.EditionRepository
import backend.graphql.utils.Permission
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
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
                reason = "Only coordinators can add awards to editions"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardId'"
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid award ID"
            )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )

        if (edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        if (awardEditionRepository.existsByAward_AwardNameAndEdition(award.awardName, edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Award with this name already exists in this edition"
            )
        }

        if (award.category.categoryEdition.none { it.edition == edition }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Award's category does not exist in this edition"
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
                reason = "Only coordinators can remove awards from editions"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardId'"
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid award ID"
            )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )

        if (!awardEditionRepository.existsByAwardAndEdition(award, edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "This award does not exist in this edition"
            )
        }

        if (edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        if (bonusesRepository.existsByAwardAndPoints_Subcategory_Edition(award, edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Award has already been assigned to students in this edition"
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