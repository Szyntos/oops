package backend.graphql.permissions

import backend.award.AwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.graphql.PhotoAssigner
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
class ChestsPermissions {

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

    fun checkAssignPhotoToChestPermission(arguments: JsonNode): Permission {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = "assignPhotoToChest",
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can assign photos to chests"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = "removeChest",
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )

        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = "assignPhotoToChest",
                arguments = arguments,
                allow = false,
                reason = "Invalid chest ID"
            )

        val chestEditions = chest.chestEdition.map { it.edition }
        if (chestEditions.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = "assignPhotoToChest",
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        val fileId = arguments.getLongField("fileId")

        return photoAssigner.getAssignPhotoToAwardPermission(chestsRepository, "image/chest", chestId, fileId)

    }

    fun checkAddChestPermission(arguments: JsonNode): Permission {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = "addChest",
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add chests"
            )
        }

        val chestType = arguments.getStringField("chestType") ?: return Permission(
            action = "addChest",
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestType'"
        )

        val fileId = arguments.getLongField("fileId")

        val photoPermission = photoAssigner.getAssignPhotoToAwardPermission(chestsRepository, "image/chest", null, fileId)
        if (!photoPermission.allow) {
            return photoPermission
        }

        val awardBundleCount = arguments.getLongField("awardBundleCount") ?: return Permission(
            action = "addChest",
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardBundleCount'"
        )

        val awardIds = arguments.getLongList("awardIds") ?: return Permission(
            action = "addChest",
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardIds'"
        )

        if (awardBundleCount < 1) {
            return Permission(
                action = "addChest",
                arguments = arguments,
                allow = false,
                reason = "Invalid 'awardBundleCount'"
            )
        }
        if (awardBundleCount > awardIds.size) {
            return Permission(
                action = "addChest",
                arguments = arguments,
                allow = false,
                reason = "awardBundleCount cannot be greater than the number of awards"
            )
        }

        awardIds.forEach { awardId ->
            val award = awardRepository.findById(awardId).orElse(null)
                ?: return Permission(
                    action = "addChest",
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid award ID"
                )
        }

        return Permission(
            action = "addChest",
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkEditChestPermission(arguments: JsonNode): Permission {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = "addChest",
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can edit chests"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = "editChest",
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )

        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = "editChest",
                arguments = arguments,
                allow = false,
                reason = "Invalid chest ID"
            )

        val chestEditions = chest.chestEdition.map { it.edition }

        if (chestEditions.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = "editChest",
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        val fileId = arguments.getLongField("fileId")
        val photoPermission = photoAssigner.getAssignPhotoToAwardPermission(chestsRepository, "image/chest", chestId, fileId)
        if (!photoPermission.allow) {
            return photoPermission
        }

        val awardIds = arguments.getLongList("awardIds")
            ?: return Permission(
                action = "editChest",
                arguments = arguments,
                allow = false,
                reason = "Invalid or missing 'awardIds'"
            )

        awardIds.forEach { awardId ->
            val award = awardRepository.findById(awardId).orElse(null)
                ?: return Permission(
                    action = "editChest",
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid award ID"
                )
        }

        val awardBundleCount = arguments.getLongField("awardBundleCount")

        if (awardBundleCount != null) {
            if (awardBundleCount < 1) {
                return Permission(
                    action = "editChest",
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid 'awardBundleCount'"
                )
            }
            if (awardBundleCount > awardIds.size) {
                return Permission(
                    action = "editChest",
                    arguments = arguments,
                    allow = false,
                    reason = "awardBundleCount cannot be greater than the number of awards"
                )
            }
            if (chestHistoryRepository.findByChest(chest).any {it.opened}) {
                return Permission(
                    action = "editChest",
                    arguments = arguments,
                    allow = false,
                    reason = "Users have already opened this chest"
                )

            }
        }

        return Permission(
            action = "editChest",
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveChestPermission(arguments: JsonNode): Permission {

        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = "removeChest",
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove chests"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = "removeChest",
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )


        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = "removeChest",
                arguments = arguments,
                allow = false,
                reason = "Invalid chest ID"
            )

        val chestEditions = chest.chestEdition.map { it.edition }
        if (chestEditions.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = "removeChest",
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }
        if (chestEditions.any { it.startDate.isBefore(LocalDate.now()) } && chestHistoryRepository.existsByChest(chest)) {
            return Permission(
                action = "removeChest",
                arguments = arguments,
                allow = false,
                reason = "Users have already been given this chest"
            )
        }

        return Permission(
            action = "removeChest",
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkCopyChestPermission(arguments: JsonNode): Permission {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = "copyChest",
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can copy chests"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = "copyChest",
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )

        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = "copyChest",
                arguments = arguments,
                allow = false,
                reason = "Invalid chest ID"
            )

        return Permission(
            action = "copyChest",
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}