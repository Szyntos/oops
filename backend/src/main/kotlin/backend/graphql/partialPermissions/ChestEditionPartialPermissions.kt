package backend.graphql.partialPermissions

import backend.award.AwardRepository
import backend.awardEdition.AwardEditionRepository
import backend.chestAward.ChestAwardRepository
import backend.chestEdition.ChestEdition
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.Permission
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class ChestEditionPartialPermissions {

    @Autowired
    private lateinit var awardEditionRepository: AwardEditionRepository

    @Autowired
    private lateinit var chestAwardRepository: ChestAwardRepository

    @Autowired
    private lateinit var editionRepository: EditionRepository

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

    fun checkAddChestToEditionPermission(arguments: JsonNode): Permission {
        val action = "addChestToEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add chests to editions"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid chest ID"
            )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )

        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        if (chestEditionRepository.existsByChest_ChestTypeAndEdition(chest.chestType, edition)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Chest with this type already exists in this edition"
            )
        }

        val awardsInChest = chestAwardRepository.findByChest(chest).map { it.award }

        if (awardsInChest.any {award -> !awardEditionRepository.existsByAwardAndEdition(award, edition)}){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Not all awards in this chest are available in this edition"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveChestFromEditionPermission(arguments: JsonNode): Permission {
        val action = "removeChestFromEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove chests from editions"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid chest ID"
            )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )

        if (!chestEditionRepository.existsByChestAndEdition(chest, edition)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "This chest does not exist in this edition"
            )
        }

        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        if (chestHistoryRepository.existsByChestAndSubcategory_Edition(chest, edition)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Users have already been given this chest in this edition"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkActivateChestInEditionPermission(arguments: JsonNode): Permission {
        val action = "activateChestInEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can activate chests in editions"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val chestEdition = chestEditionRepository.findByChest_ChestIdAndEdition_EditionId(chestId, editionId)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "ChestEdition not found"
            )

        if (chestEdition.active){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Chest is already active in this edition"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkDeactivateChestInEditionPermission(arguments: JsonNode): Permission {
        val action = "deactivateChestInEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can deactivate chests in editions"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val chestEdition = chestEditionRepository.findByChest_ChestIdAndEdition_EditionId(chestId, editionId)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "ChestEdition not found"
            )

        if (!chestEdition.active){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Chest is already inactive in this edition"
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