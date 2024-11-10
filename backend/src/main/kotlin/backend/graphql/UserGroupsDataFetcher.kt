package backend.graphql

import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEdition
import backend.chests.Chests
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.permissions.PermissionDeniedException
import backend.graphql.permissions.PermissionInput
import backend.graphql.permissions.PermissionService
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.userGroups.UserGroups
import backend.userGroups.UserGroupsRepository
import backend.users.Users
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class UserGroupsDataFetcher {
    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    lateinit var usersRepository: UsersRepository

    @Autowired
    lateinit var pointsRepository: PointsRepository

    @Autowired
    lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    lateinit var groupsRepository: GroupsRepository

    @Autowired
    lateinit var editionRepository: EditionRepository

    @Autowired
    lateinit var fileEntityRepository: FileEntityRepository

    @Autowired
    lateinit var chestsRepository: ChestsRepository

    @Autowired
    lateinit var photoAssigner: PhotoAssigner

    @Autowired
    lateinit var userGroupsRepository: UserGroupsRepository


    @DgsMutation
    @Transactional
    fun addUserToGroup(@InputArgument userId: Long, @InputArgument groupId: Long): UserGroups {
        val action = "addUserToGroup"
        val arguments = mapOf(
            "userId" to userId,
            "groupId" to groupId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val user = usersRepository.findById(userId).orElseThrow { throw IllegalArgumentException("User not found") }
        val group = groupsRepository.findById(groupId).orElseThrow { throw IllegalArgumentException("Group not found") }

        val userGroup = UserGroups(
            user = user,
            group = group
        )
        return userGroupsRepository.save(userGroup)
    }

    @DgsMutation
    @Transactional
    fun removeUserFromGroup(@InputArgument userId: Long, @InputArgument groupId: Long): Boolean {
        val action = "removeUserFromGroup"
        val arguments = mapOf(
            "userId" to userId,
            "groupId" to groupId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val group = groupsRepository.findById(groupId).orElseThrow { throw IllegalArgumentException("Group not found") }

        val user = usersRepository.findById(userId).orElseThrow { throw IllegalArgumentException("User not found") }

        userGroupsRepository.deleteByUserAndGroup(user, group)
        return true
    }

    @DgsMutation
    @Transactional
    fun changeStudentGroup(@InputArgument userId: Long, @InputArgument groupId: Long): UserGroups {
        val action = "changeStudentGroup"
        val arguments = mapOf(
            "userId" to userId,
            "groupId" to groupId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val group = groupsRepository.findById(groupId).orElseThrow { throw IllegalArgumentException("Group not found") }

        val user = usersRepository.findById(userId).orElseThrow { throw IllegalArgumentException("User not found") }

        val userGroups = userGroupsRepository.findByUserAndGroup_Edition(user, group.edition)
        userGroups.forEach {
            userGroupsRepository.delete(it)
        }
        val newUserGroup = UserGroups(
            user = user,
            group = group
        )
        return userGroupsRepository.save(newUserGroup)
    }

}
