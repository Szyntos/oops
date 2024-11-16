package backend.graphql.partialPermissions

import backend.award.AwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.utils.PhotoAssigner
import backend.groups.GroupsRepository
import backend.graphql.utils.Permission
import backend.userGroups.UserGroupsRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getIntField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.JsonNodeExtensions.getTimeField
import backend.utils.JsonNodeExtensions.getUserIdsType
import backend.utils.JsonNodeExtensions.getUsersInputTypeList
import backend.utils.UserMapper
import backend.weekdays.WeekdaysRepository
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.sql.Time
import kotlin.jvm.optionals.getOrNull

@Service
class GroupsPartialPermissions {


    @Autowired
    private lateinit var userGroupsRepository: UserGroupsRepository

    @Autowired
    private lateinit var usersRepository: UsersRepository

    @Autowired
    private lateinit var weekdaysRepository: WeekdaysRepository

    @Autowired
    private lateinit var fileEntityRepository: FileEntityRepository

    @Autowired
    private lateinit var groupsRepository: GroupsRepository

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

    fun checkEditGroupWithUsersPermission(arguments: JsonNode): Permission {
        val action = "editGroupWithUsers"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can edit groups"
            )
        }

        val groupId = arguments.getLongField("groupId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'groupId'"
        )

        val group = groupsRepository.findById(groupId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid group ID"
            )

        if (currentUser.role == UsersRoles.TEACHER){
            if (group.teacher.userId != currentUser.userId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only edit their groups"
                )
            }
        }

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
    fun checkRemoveGroupPermission(arguments: JsonNode): Permission {
        val action = "removeGroup"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove groups"
            )
        }

        val groupId = arguments.getLongField("groupId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'groupId'"
        )

        val group = groupsRepository.findById(groupId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid group ID"
            )

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        if (group.userGroups.any { userGroup -> userGroup.user.points.isNotEmpty()}){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Cannot remove group with users that have points"
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