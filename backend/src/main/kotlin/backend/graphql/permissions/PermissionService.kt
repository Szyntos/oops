package backend.graphql.permissions

import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PermissionService {

    @Autowired
    private lateinit var chestsPermissions: ChestsPermissions

    fun checkFullPermission(input: PermissionInput): Permission {
        val jsonArguments = objectMapper.readTree(input.arguments)
        return when (input.action) {
            "assignPhotoToChest" -> chestsPermissions.checkAssignPhotoToChestPermission(jsonArguments)
            "addChest" -> chestsPermissions.checkAddChestPermission(jsonArguments)
            "editChest" -> chestsPermissions.checkEditChestPermission(jsonArguments)
            "removeChest" -> chestsPermissions.checkRemoveChestPermission(jsonArguments)
            "copyChest" -> chestsPermissions.checkCopyChestPermission(jsonArguments)
            else -> Permission(
                action = input.action,
                arguments = jsonArguments,
                allow = false,
                reason = "Unknown action '${input.action}'"
            )
        }
    }

    fun checkPartialPermission(input: PermissionInput): Permission {
        val jsonArguments = objectMapper.readTree(input.arguments)
        return Permission(
            action = input.action,
            arguments = jsonArguments,
            allow = false,
            reason = "Unknown action '${input.action}'"
        )
    }
}

class PermissionDeniedException(message: String) : Exception(message)

data class PermissionInput(
    val action: String,
    val arguments: String
)

data class Permission(
    val action: String,
    val arguments: JsonNode,
    val allow: Boolean,
    val reason: String?
)

