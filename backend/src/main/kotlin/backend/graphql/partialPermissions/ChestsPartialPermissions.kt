package backend.graphql.partialPermissions

import backend.award.AwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.Permission
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getLongList
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class ChestsPartialPermissions {

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

    fun checkEditChestPermission(arguments: JsonNode): Permission {
        val action = "editChest"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can edit chests"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )

        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid chest ID"
            )

        val chestEditions = chest.chestEdition.map { it.edition }

        if (chestEditions.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        if (chestHistoryRepository.findByChest_AndOpened(chest, true).isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Users have already opened this chest"
            )

        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveChestPermission(arguments: JsonNode): Permission {
        val action = "removeChest"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove chests"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )


        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid chest ID"
            )

        val chestEditions = chest.chestEdition.map { it.edition }
        if (chestEditions.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }
        if (chestHistoryRepository.existsByChest(chest)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Users have already been given this chest"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkCopyChestPermission(arguments: JsonNode): Permission {
        val action = "copyChest"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can copy chests"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )

        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid chest ID"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}