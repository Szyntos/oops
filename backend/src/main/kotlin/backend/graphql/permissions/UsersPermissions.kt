package backend.graphql.permissions

import backend.award.AwardRepository
import backend.award.AwardType
import backend.bonuses.BonusesRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.*
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.userGroups.UserGroups
import backend.userGroups.UserGroupsRepository
import backend.users.FirebaseUserService
import backend.users.Users
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getBooleanField
import backend.utils.JsonNodeExtensions.getIntField
import backend.utils.JsonNodeExtensions.getIntList
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.JsonNodeExtensions.getTimeField
import backend.utils.JsonNodeExtensions.getUserIdsType
import backend.utils.JsonNodeExtensions.getUsersInputTypeList
import backend.utils.UserMapper
import backend.weekdays.WeekdaysRepository
import com.fasterxml.jackson.databind.JsonNode
import com.google.firebase.ErrorCode
import com.google.firebase.auth.FirebaseAuthException
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.LocalDateTime
import kotlin.jvm.optionals.getOrNull
import kotlin.math.min

@Service
class UsersPermissions {

    @Autowired
    private lateinit var bonusesRepository: BonusesRepository

    @Autowired
    private lateinit var pointsRepository: PointsRepository

    @Autowired
    private lateinit var firebaseUserService: FirebaseUserService

    @Autowired
    private lateinit var usersDataFetcher: UsersDataFetcher

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

    @Value("\${constants.emailDomain}")
    lateinit var emailDomain: String

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

        val permission = photoAssigner.checkAssignPhotoToAwardPermission(usersRepository, "image/user", userId, null)
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

    fun checkRemoveUserPermission(arguments: JsonNode): Permission{
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

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkResetPasswordPermission(arguments: JsonNode): Permission{
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

    fun checkGetStudentPointsPermission(arguments: JsonNode): Permission{
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

    fun checkGetSumOfPointsForStudentByCategoryPermission(arguments: JsonNode): Permission{
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

    fun checkGetCurrentUserPermission(arguments: JsonNode): Permission{
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
        }

        if (UsersRoles.valueOf(role.uppercase()) == UsersRoles.COORDINATOR) {
            if (currentUser.role != UsersRoles.COORDINATOR || currentUser.userId != 0L) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Only a coordinator can add a coordinator"
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

        val permission = photoAssigner.checkAssignPhotoToAwardPermission(usersRepository, "image/user", null, imageFileId)
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