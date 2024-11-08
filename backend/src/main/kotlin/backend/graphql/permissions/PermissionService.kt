package backend.graphql.permissions

import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.DgsQuery
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PermissionService {

    @Autowired
    private lateinit var chestsPermissions: ChestsPermissions

    @DgsQuery
    @Transactional
    fun checkFullPermission(input: PermissionInput): Permission {
        return when (input.action) {
            "assignPhotoToChest" -> chestsPermissions.checkAssignPhotoToChestPermission(input.arguments)
            "addChest" -> chestsPermissions.checkAddChestPermission(input.arguments)
            "editChest" -> chestsPermissions.checkEditChestPermission(input.arguments)
            "removeChest" -> chestsPermissions.checkRemoveChestPermission(input.arguments)
            "copyChest" -> chestsPermissions.checkCopyChestPermission(input.arguments)
            else -> Permission(
                action = input.action,
                arguments = input.arguments,
                allow = false,
                reason = "Unknown action '${input.action}'"
            )
        }
    }

    @DgsQuery
    @Transactional
    fun checkPartialPermission(input: PermissionInput): Permission {
        return Permission(
            action = input.action,
            arguments = input.arguments,
            allow = false,
            reason = "Unknown action '${input.action}'"
        )
//        return when (input.action) {
//            "assignPhotoToChest" -> chestsPermissions.checkAssignPhotoToChestPermission(input.arguments)
//            "addChest" -> chestsPermissions.checkAddChestPermission(input.arguments)
//            "editChest" -> chestsPermissions.checkEditChestPermission(input.arguments)
//            "removeChest" -> chestsPermissions.checkRemoveChestPermission(input.arguments)
//            "copyChest" -> chestsPermissions.checkCopyChestPermission(input.arguments)
//            else -> Permission(
//                action = input.action,
//                arguments = input.arguments,
//                allow = false,
//                reason = "Unknown action '${input.action}'"
//            )
//        }
    }
}

class PermissionDeniedException(message: String) : Exception(message)

data class PermissionInput(
    val action: String,
    val arguments: JsonNode
)

data class Permission(
    val action: String,
    val arguments: JsonNode,
    val allow: Boolean,
    val reason: String?
)

