package backend.graphql

import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEdition
import backend.chests.Chests
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
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
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class UserGroupsDataFetcher {
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can add users to groups")
        }

        val user = usersRepository.findById(userId).orElseThrow { throw IllegalArgumentException("User not found") }
        val group = groupsRepository.findById(groupId).orElseThrow { throw IllegalArgumentException("Group not found") }

        if (userGroupsRepository.existsByUserAndGroup(user, group)){
            throw IllegalArgumentException("This User already exists in this Group")
        }

        if (userGroupsRepository.existsByUserAndGroup_Edition(user, group.edition)){
            throw IllegalArgumentException("This User already exists in this Edition")
        }

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }

        val userGroup = UserGroups(
            user = user,
            group = group
        )
        return userGroupsRepository.save(userGroup)
    }

    @DgsMutation
    @Transactional
    fun removeUserFromGroup(@InputArgument userId: Long, @InputArgument groupId: Long): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            throw IllegalArgumentException("Student cannot remove users from groups")
        }
        if (currentUser.role == UsersRoles.TEACHER){
            val group = groupsRepository.findById(groupId).orElseThrow { throw IllegalArgumentException("Group not found") }
            if (group.teacher.userId != currentUser.userId){
                throw IllegalArgumentException("Teacher can only remove users from their groups")
            }
        }

        val user = usersRepository.findById(userId).orElseThrow { throw IllegalArgumentException("User not found") }
        val group = groupsRepository.findById(groupId).orElseThrow { throw IllegalArgumentException("Group not found") }

        if (!userGroupsRepository.existsByUserAndGroup(user, group)){
            throw IllegalArgumentException("This User does not exist in this Group")
        }

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }

        userGroupsRepository.deleteByUserAndGroup(user, group)
        return true
    }

    @DgsMutation
    @Transactional
    fun changeStudentGroup(@InputArgument userId: Long, @InputArgument groupId: Long): UserGroups {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            throw IllegalArgumentException("Student cannot change groups")
        }
        if (currentUser.role == UsersRoles.TEACHER){
            val group = groupsRepository.findById(groupId).orElseThrow { throw IllegalArgumentException("Group not found") }
            if (group.teacher.userId != currentUser.userId){
                throw IllegalArgumentException("Teacher can only change groups of their students")
            }
        }

        val user = usersRepository.findById(userId).orElseThrow { throw IllegalArgumentException("User not found") }
        if (user.role != UsersRoles.STUDENT){
            throw IllegalArgumentException("This mutation is only for students")
        }
        val group = groupsRepository.findById(groupId).orElseThrow { throw IllegalArgumentException("Group not found") }

        if (userGroupsRepository.existsByUserAndGroup(user, group)){
            throw IllegalArgumentException("This User already exists in this Group")
        }

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }

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
