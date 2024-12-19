package backend.graphql.permissions

import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.utils.PhotoAssigner
import backend.groups.GroupsRepository
import backend.graphql.utils.Permission
import backend.graphql.utils.PermissionDeniedException
import backend.graphql.utils.PermissionInput
import backend.userLevel.UserLevel
import backend.userLevel.UserLevelRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getBooleanField
import backend.utils.JsonNodeExtensions.getDoubleField
import backend.utils.JsonNodeExtensions.getFloatField
import backend.utils.JsonNodeExtensions.getIntField
import backend.utils.JsonNodeExtensions.getIntList
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import kotlin.jvm.optionals.getOrNull

@Service
class UsersPermissions {
    @Autowired
    private lateinit var userLevelRepository: UserLevelRepository

    @Autowired
    private lateinit var usersRepository: UsersRepository

    @Autowired
    private lateinit var fileEntityRepository: FileEntityRepository

    @Autowired
    private lateinit var groupsRepository: GroupsRepository

    @Autowired
    private lateinit var editionRepository: EditionRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var photoAssigner: PhotoAssigner

    @Value("\${constants.emailDomain}")
    lateinit var emailDomain: String

    fun checkListSetupUsersPermission(arguments: JsonNode): Permission{
        val action = "listSetupUsers"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only a coordinator can list setup users"
            )
        }
        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAssignPhotoToUserPermission(arguments: JsonNode): Permission {
        val action = "assignPhotoToUser"
        val currentUser = userMapper.getCurrentUser()

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'userId'"
        )

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != userId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can assign photos to other users"
            )
        }

        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid user ID"
            )

        if (currentUser.role == UsersRoles.TEACHER && user.role == UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Teacher cannot assign a photo to a coordinator"
            )
        }

        if (currentUser.role == UsersRoles.STUDENT){
            if (currentUser.avatarSetByUser){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Student already has an avatar"
                )
            }
        }

        val permission = photoAssigner.checkAssignPhotoToAssigneePermission(usersRepository, "image/user", userId, null)
        if (!permission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = permission.reason
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkSetStudentNickPermission(arguments: JsonNode): Permission {
        val action = "setStudentNick"
        val currentUser = userMapper.getCurrentUser()

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'userId'"
        )

        val nick = arguments.getStringField("nick") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'nick'"
        )

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != userId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can set nicks to other users"
            )
        }

        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid user ID"
            )

        if (user.role != UsersRoles.STUDENT) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User is not a student"
            )
        }

        if (currentUser.role == UsersRoles.STUDENT){
            if (currentUser.nickSetByUser){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Student already set their nick"
                )
            }
        }

        if (usersRepository.findAllByNick(nick).any { it.userId != userId }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User with nick $nick already exists"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            val userGroupsEditions = groupsRepository.findByUserGroups_User_UserId(userId).map { it.edition }
            val teacherGroupsEditions = groupsRepository.findByTeacher_UserId(currentUser.userId).map { it.edition }
            if (userGroupsEditions.intersect(teacherGroupsEditions.toSet()).isEmpty()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only set nicks of students that are in their editions"
                )
            }
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddUserPermission(arguments: JsonNode): Permission {
        val action = "addUser"
        val currentUser = userMapper.getCurrentUser()

        val indexNumber = arguments.getIntField("indexNumber") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'indexNumber'"
        )

        val nick = arguments.getStringField("nick") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'nick'"
        )

        val firstName = arguments.getStringField("firstName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'firstName'"
        )

        val secondName = arguments.getStringField("secondName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'secondName'"
        )

        val role = arguments.getStringField("role") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'role'"
        )

        val email = arguments.getStringField("email") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'email'"
        )

        val createFirebaseUser = arguments.getBooleanField("createFirebaseUser") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'createFirebaseUser'"
        )

        val sendEmail = arguments.getBooleanField("sendEmail") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'sendEmail'"
        )

        val permission = checkAddUserHelperPermission(indexNumber, nick, firstName, secondName, role, email, "", createFirebaseUser, sendEmail)
        if (!permission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = permission.reason
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddTeacherPermission(arguments: JsonNode): Permission {
        val action = "addTeacher"
        val currentUser = userMapper.getCurrentUser()

        val firstName = arguments.getStringField("firstName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'firstName'"
        )

        val secondName = arguments.getStringField("secondName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'secondName'"
        )

        val label = arguments.getStringField("label") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'label'"
        )

        val email = arguments.getStringField("email") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'email'"
        )

        val createFirebaseUser = arguments.getBooleanField("createFirebaseUser") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'createFirebaseUser'"
        )

        val sendEmail = arguments.getBooleanField("sendEmail") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'sendEmail'"
        )

        val permission = checkAddUserHelperPermission(-1, "", firstName, secondName, "teacher", email, label, createFirebaseUser, sendEmail)

        if (!permission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = permission.reason
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkParseUsersFromCsvPermission(arguments: JsonNode): Permission {
        val action = "parseUsersFromCsv"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only a coordinator can parse users from a CSV file"
            )
        }

        val fileId = arguments.getLongField("fileId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'fileId'"
        )

        val file = fileEntityRepository.findById(fileId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid file ID"
            )
        if (file.fileType != "text/csv") {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid file type"
            )
        }
        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkValidateUsersToBeAddedPermission(arguments: JsonNode): Permission {
        val action = "validateUsersToBeAdded"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only a coordinator can validate users to be added")
        }

        val userIndexes = arguments.getIntList("userIndexes") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'userIndexes'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkEditUserPermission(arguments: JsonNode): Permission {
        val action = "editUser"
        val currentUser = userMapper.getCurrentUser()

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'userId'"
        )

        val indexNumber = arguments.getIntField("indexNumber")

        val nick = arguments.getStringField("nick")

        val firstName = arguments.getStringField("firstName")

        val secondName = arguments.getStringField("secondName")

        val role = arguments.getStringField("role")

        val label = arguments.getStringField("label")

        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid user ID"
            )

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            if (currentUser.userId != userId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Students can only edit themselves"
                )
            }
            if (indexNumber != null || firstName != null || secondName != null || role != null || label != null){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Students can only edit their own nick"
                )
            }
        }
        if (currentUser.role == UsersRoles.TEACHER){
            if (currentUser.userId != userId && user.role != UsersRoles.STUDENT){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only edit students or themselves"
                )
            }
            if (currentUser.userId == userId){
                if (role != null){
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "Teacher cannot edit their own role"
                    )
                }
            }

            val activeUserEditions = user.userGroups.map { it.group.edition }.filter { it.endDate.isAfter(java.time.LocalDate.now()) }
            if (activeUserEditions.isEmpty()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only edit students that are in an active edition"
                )
            }

            val userGroups = groupsRepository.findByUserGroups_User_UserId(userId)
            if (userGroups.none { it.teacher == currentUser }){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only edit students that are in their groups"
                )
            }
            if (role != null){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher cannot edit role of a student"
                )
            }
        }


        indexNumber?.let {
            if (usersRepository.existsByIndexNumber(it) && it != user.indexNumber) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "User with index number $it already exists"
                )
            }
            user.indexNumber = it
        }

        nick?.let {
            if (usersRepository.findByNick(it) != null && it != user.nick) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "User with nick $it already exists"
                )
            }
            user.nick = it
        }

        firstName?.let {
            user.firstName = it
        }

        secondName?.let {
            user.secondName = it
        }

        role?.let {
            val userRole = try {
                UsersRoles.valueOf(it.uppercase())
            } catch (e: IllegalArgumentException) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid role"
                )
            }
            user.role = userRole
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveUserPermission(arguments: JsonNode): Permission {
        val action = "removeUser"
        val currentUser = userMapper.getCurrentUser()

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'userId'"
        )
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only a coordinator can remove a user"
            )
        }
        if (currentUser.userId == userId){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Cannot remove yourself"
            )
        }

        val user = usersRepository.findById(userId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid user ID"
            )

        if (user.role == UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Cannot remove coordinator"
            )
        }

        if (user.userGroups.isNotEmpty()){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Cannot remove user that is in a group"
            )
        }

        if (user.points.isNotEmpty() || user.pointsByTeacher.isNotEmpty() || user.pointsByUpdatedBy.isNotEmpty()
            || user.pointsHistory.isNotEmpty() || user.pointsHistoryByTeacher.isNotEmpty()){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Cannot remove user that has points"
            )
        }


        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkResetPasswordPermission(arguments: JsonNode): Permission {
        val action = "resetPassword"
        val currentUser = userMapper.getCurrentUser()

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'userId'"
        )

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != userId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can reset passwords of other users"
            )
        }

        val user = usersRepository.findByUserId(userId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid user ID"
            )
        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkResetPasswordByEmailPermission(arguments: JsonNode): Permission {
        val action = "resetPasswordByEmail"

        val email = arguments.getStringField("email") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'email'"
        )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkMarkPassingStudentsFromEditionAsInactivePermission(arguments: JsonNode): Permission{
        val action = "markPassingStudentsFromEditionAsInactive"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only a coordinator can mark passing students from an edition as inactive"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )

        if (edition.endDate.isAfter(java.time.LocalDate.now().plusDays(60))){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Can only mark students as inactive if edition ends in 60 days or less"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkMarkStudentAsInactivePermission(arguments: JsonNode): Permission{
        val action = "markStudentAsInactive"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only a coordinator can mark student as inactive"
            )
        }

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'userId'"
        )

        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid user ID"
            )

        if (user.role != UsersRoles.STUDENT){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User is not a student"
            )
        }

        if (!user.active){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User is already inactive"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkMarkStudentAsActivePermission(arguments: JsonNode): Permission{
        val action = "markStudentAsActive"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only a coordinator can mark student as active"
            )
        }

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'userId'"
        )

        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid user ID"
            )

        if (user.role != UsersRoles.STUDENT){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User is not a student"
            )
        }

        if (user.active){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User is already active"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkOverrideComputedGradeForUserPermission(arguments: JsonNode): Permission {
        val action = "overrideComputedGradeForUser"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR && currentUser.role != UsersRoles.TEACHER){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only a coordinator or teacher can override computed grade for a user"
            )
        }

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'userId'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val grade = arguments.getFloatField("grade") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'grade'"
        )

        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid user ID"
            )
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )
        val userLevel = user.userLevels.find { it.edition == edition }
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User has no user level in this edition"
            )
        // grade should be 2.0 or 3.0 or 3.5 or 4.0 or 4.5 or 5.0
        if (grade != 2.0f && grade != 3.0f && grade != 3.5f && grade != 4.0f && grade != 4.5f && grade != 5.0f){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid grade"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkTurnOffOverrideComputedGradeForUserPermission(arguments: JsonNode): Permission {
        val action = "turnOffOverrideComputedGradeForUser"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR && currentUser.role != UsersRoles.TEACHER){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only a coordinator or teacher can turn off override for computed grade for a user"
            )
        }

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'userId'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )


        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid user ID"
            )
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )
        val userLevel = user.userLevels.find { it.edition == edition }
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User has no user level in this edition"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkGetStudentPointsPermission(arguments: JsonNode): Permission {
        val action = "getStudentPoints"
        val currentUser = userMapper.getCurrentUser()

        val studentId = arguments.getLongField("studentId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'studentId'"
        )

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != studentId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can view points of other users"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val user = usersRepository.findById(studentId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid student ID"
            )
        if (user.role != UsersRoles.STUDENT) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User is not a student"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            val userGroupsEditions = groupsRepository.findByUserGroups_User_UserId(studentId).map { it.edition }
            val teacherGroupsEditions = groupsRepository.findByTeacher_UserId(currentUser.userId).map { it.edition }
            if (userGroupsEditions.intersect(teacherGroupsEditions).isEmpty()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only view points of students that are in their editions"
                )
            }
        }

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )
        if (user.userGroups.none { it.group.edition == edition }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student is not participating in this edition"
            )
        }
        val teacher = user.userGroups.firstOrNull { it.group.edition == edition }?.group?.teacher
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student is not participating in this edition"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkGetSumOfPointsForStudentByCategoryPermission(arguments: JsonNode): Permission {
        val action = "getSumOfPointsForStudentByCategory"
        val currentUser = userMapper.getCurrentUser()

        val studentId = arguments.getLongField("studentId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'studentId'"
        )
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != studentId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can view points of other users"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val user = usersRepository.findById(studentId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid student ID"
            )
        if (user.role != UsersRoles.STUDENT) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User is not a student"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            val userGroupsEditions = groupsRepository.findByUserGroups_User_UserId(studentId).map { it.edition }
            val teacherGroupsEditions = groupsRepository.findByTeacher_UserId(currentUser.userId).map { it.edition }
            if (userGroupsEditions.intersect(teacherGroupsEditions).isEmpty()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only view points of students that are in their editions"
                )
            }
        }

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )
        if (user.userGroups.none { it.group.edition == edition }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student is not participating in this edition"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkGetCurrentUserPermission(arguments: JsonNode): Permission {
        val action = "getCurrentUser"
        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddUserHelperPermission(indexNumber: Int,  nick: String,
                                     firstName: String,  secondName: String,
                                     role: String,  email: String,
                                     label: String = "",  createFirebaseUser: Boolean = false,
                                     sendEmail: Boolean = false,
                                     imageFileId: Long? = null): Permission {
        val action = "addUserHelper"
        val arguments = objectMapper.valueToTree<JsonNode>(
            mapOf(
            "indexNumber" to indexNumber,
            "nick" to nick,
            "firstName" to firstName,
            "secondName" to secondName,
            "role" to role,
            "email" to email,
            "label" to label,
            "createFirebaseUser" to createFirebaseUser,
            "sendEmail" to sendEmail,
            "imageFileId" to imageFileId
        ))

        val currentUser = userMapper.getCurrentUser()
        if (currentUser.userId != 0L && (currentUser.role != UsersRoles.COORDINATOR && currentUser.role != UsersRoles.TEACHER)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only a coordinator or a teacher can add a user"
            )
        }

        val indexNumberToSet = if (indexNumber == -1) {
            if (currentUser.role != UsersRoles.COORDINATOR) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Only a coordinator can add a teacher"
                )
            }
            if (UsersRoles.valueOf(role.uppercase()) != UsersRoles.TEACHER) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Only a teacher can be added with this mutation"
                )
            }
            if (email.isEmpty()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Email is required for a teacher"
                )
            }
            -2137
        } else {
            indexNumber
        }

        val nickToBeSet = if (indexNumber == -1) {
            if (nick.isNotBlank()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nick is not required for a teacher"
                )
            }
            "$firstName.$secondName.$indexNumberToSet"
        } else {
            if (nick.isEmpty()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nick is required"
                )
            }
            nick
        }

        // TODO: Find a better way to handle adding a first coordinator
        if (currentUser.userId == 0L ) {
            if (UsersRoles.valueOf(role.uppercase()) != UsersRoles.COORDINATOR) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Only a coordinator can be added with this bypass"
                )
            }
            if (usersRepository.existsByRole(UsersRoles.COORDINATOR)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Coordinator already exists"
                )
            }
        }

        if (UsersRoles.valueOf(role.uppercase()) == UsersRoles.COORDINATOR) {
            if (currentUser.userId != 0L) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Current user is not allowed to add a coordinator"
                )
            }
        }

        if (UsersRoles.valueOf(role.uppercase()) == UsersRoles.TEACHER) {
            if (currentUser.role != UsersRoles.COORDINATOR) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Only a coordinator can add a teacher"
                )
            }
        }


        if (usersRepository.existsByIndexNumber(indexNumberToSet)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User with index number $indexNumberToSet already exists"
            )
        }
        if (usersRepository.findByNick(nickToBeSet) != null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User with nick $nickToBeSet already exists"
            )
        }
        val userRole1 = try {
            UsersRoles.valueOf(role.uppercase())
        } catch (e: IllegalArgumentException) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid role"
            )
        }
        var userEmail = email
        if (email.isEmpty()) {
            userEmail = "$indexNumberToSet@$emailDomain"
        } else if (!isValidEmail(userEmail)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid email"
            )
        }

        if (usersRepository.existsByEmail(userEmail)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User with email $userEmail already exists"
            )
        }

        val permission = photoAssigner.checkAssignPhotoToAssigneePermission(usersRepository, "image/user", null, imageFileId)
        if (!permission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = permission.reason
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun isValidEmail(email: String): Boolean {
        val emailPattern = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
        return email.matches(Regex(emailPattern))
    }
}