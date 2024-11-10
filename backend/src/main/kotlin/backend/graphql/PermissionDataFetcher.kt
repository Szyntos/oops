package backend.graphql

import backend.graphql.permissions.Permission
import backend.graphql.permissions.PermissionInput
import backend.graphql.permissions.PermissionService
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class PermissionDataFetcher {

    @Autowired
    private lateinit var permissionService: PermissionService

    @DgsQuery
    @Transactional
    fun checkFullPermission(@InputArgument input: PermissionInput): Permission {
        val action = "checkFullPermission"
        val arguments = mapOf(
            "input" to mapOf(
                "action" to input.action,
                "arguments" to input.arguments
            )
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }

        return permissionService.checkFullPermission(input)
    }

    @DgsQuery
    @Transactional
    fun checkPartialPermission(@InputArgument input: PermissionInput): Permission {
        val action = "checkPartialPermission"
        val arguments = mapOf(
            "input" to mapOf(
                "action" to input.action,
                "arguments" to input.arguments
            )
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }

        return permissionService.checkPartialPermission(input)
    }
}
