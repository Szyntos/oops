package backend.graphql

import backend.categories.CategoriesRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.PermissionDeniedException
import backend.graphql.utils.PermissionInput
import backend.graphql.utils.PermissionService
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.userGroups.UserGroups
import backend.userGroups.UserGroupsRepository
import backend.users.UsersRepository
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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val user = usersRepository.findById(userId).orElseThrow { throw IllegalArgumentException("Nie znaleziono użytkownika o id $userId") }
        val group = groupsRepository.findById(groupId).orElseThrow { throw IllegalArgumentException("Nie znaleziono grupy o id $groupId") }

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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val group = groupsRepository.findById(groupId).orElseThrow { throw IllegalArgumentException("Nie znaleziono grupy o id $groupId") }

        val user = usersRepository.findById(userId).orElseThrow { throw IllegalArgumentException("Nie znaleziono użytkownika o id $userId") }

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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val group = groupsRepository.findById(groupId).orElseThrow { throw IllegalArgumentException("Nie znaleziono grupy o id $groupId") }

        val user = usersRepository.findById(userId).orElseThrow { throw IllegalArgumentException("Nie znaleziono użytkownika o id $userId") }

        userGroupsRepository.deleteByUserAndEdition(user.userId, group.edition.editionId)

        val newUserGroup = UserGroups(
            user = user,
            group = group
        )
        return userGroupsRepository.save(newUserGroup)
    }

}
