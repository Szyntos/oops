package backend.graphql

import backend.graphql.permissions.Permission
import backend.graphql.permissions.PermissionInput
import backend.graphql.permissions.PermissionService
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class PermissionDataFetcher {

    @Autowired
    private lateinit var permissionService: PermissionService

    @DgsQuery
    @Transactional
    fun checkPermission(@InputArgument input: PermissionInput): Permission {
        return permissionService.checkPermission(input)
    }
}
