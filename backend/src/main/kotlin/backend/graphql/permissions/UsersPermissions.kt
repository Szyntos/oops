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
                reason = "Tylko koordynatorzy mogą wylistować użytkowników do setupu"
            )
        }
        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
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
            reason = "Nieprawidłowe lub brakujące 'userId'"
        )

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != userId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko prowadzący i koordynatorzy mogą przypisywać zdjęcia do innych użytkowników"
            )
        }

        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono użytkownika o id $userId"
            )

        if (currentUser.role == UsersRoles.TEACHER && user.role == UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Prowadzący nie może przypisać zdjęcia do koordynatora"
            )
        }

        if (currentUser.role == UsersRoles.STUDENT){
            if (currentUser.avatarSetByUser){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Student już ma przypisane zdjęcie"
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
            reason = "Nieprawidłowe lub brakujące 'userId'"
        )

        val nick = arguments.getStringField("nick") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'nick'"
        )

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != userId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko prowadzący i koordynatorzy mogą ustawiać nicki innym użytkownikom"
            )
        }

        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono użytkownika o id $userId"
            )

        if (user.role != UsersRoles.STUDENT) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik nie jest studentem"
            )
        }

        if (currentUser.role == UsersRoles.STUDENT){
            if (currentUser.nickSetByUser){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Student już ustawił swój nick"
                )
            }
        }

        if (usersRepository.findAllByNick(nick).any { it.userId != userId }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik o nicku $nick już istnieje"
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
                    reason = "Prowadzący może ustawić nicki tylko studentom z jego grup"
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
            reason = "Nieprawidłowe lub brakujące 'indexNumber'"
        )

        val nick = arguments.getStringField("nick") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'nick'"
        )

        val firstName = arguments.getStringField("firstName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'firstName'"
        )

        val secondName = arguments.getStringField("secondName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'secondName'"
        )

        val role = arguments.getStringField("role") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'role'"
        )

        val email = arguments.getStringField("email") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'email'"
        )

        val createFirebaseUser = arguments.getBooleanField("createFirebaseUser") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'createFirebaseUser'"
        )

        val sendEmail = arguments.getBooleanField("sendEmail") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'sendEmail'"
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
            reason = "Nieprawidłowe lub brakujące 'firstName'"
        )

        val secondName = arguments.getStringField("secondName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'secondName'"
        )

        val label = arguments.getStringField("label") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'label'"
        )

        val email = arguments.getStringField("email") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'email'"
        )

        val createFirebaseUser = arguments.getBooleanField("createFirebaseUser") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'createFirebaseUser'"
        )

        val sendEmail = arguments.getBooleanField("sendEmail") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'sendEmail'"
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
                reason = "Tylko koordynatorzy mogą parsować użytkowników z pliku CSV"
            )
        }

        val fileId = arguments.getLongField("fileId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'fileId'"
        )

        val file = fileEntityRepository.findById(fileId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono pliku o id $fileId"
            )
        if (file.fileType != "text/csv") {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nieprawidłowy typ pliku"
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
            throw IllegalArgumentException("Tylko koordynatorzy mogą walidować użtkowników do dodania")
        }

        val userIndexes = arguments.getIntList("userIndexes") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'userIndexes'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
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
            reason = "Nieprawidłowe lub brakujące 'userId'"
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
                reason = "Nie znaleziono użytkownika o id $userId"
            )

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            if (currentUser.userId != userId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Studenci mogę jedynie edytować samych siebie"
                )
            }
            if (indexNumber != null || firstName != null || secondName != null || role != null || label != null){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Studenci mogą jedynie edytować swój nick"
                )
            }
        }
        if (currentUser.role == UsersRoles.TEACHER){
            if (currentUser.userId != userId && user.role != UsersRoles.STUDENT){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący mogą edytować tylko studentów lub siebie"
                )
            }
            if (currentUser.userId == userId){
                if (role != null){
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "Prowadzący nie może edytować swojej roli"
                    )
                }
            }

            val activeUserEditions = user.userGroups.map { it.group.edition }.filter { it.endDate.isAfter(java.time.LocalDate.now()) }
            if (activeUserEditions.isEmpty()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący mogą edytować tylko studentów z aktywnej edycji"
                )
            }

            val userGroups = groupsRepository.findByUserGroups_User_UserId(userId)
            if (userGroups.none { it.teacher == currentUser }){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący mogą edytować tylko studentów z ich grup"
                )
            }
            if (role != null){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący nie może edytować roli studenta"
                )
            }
        }


        indexNumber?.let {
            if (usersRepository.existsByIndexNumber(it) && it != user.indexNumber) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Użytkownik o indeksie $it już istnieje"
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
                    reason = "Użytkownik o nicku $it już istnieje"
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
                    reason = "Nieprawidłowa rola"
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
            reason = "Nieprawidłowe lub brakujące 'userId'"
        )
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą usuwać użytkowników"
            )
        }
        if (currentUser.userId == userId){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie można usunąć siebie"
            )
        }

        val user = usersRepository.findById(userId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono użytkownika o id $userId"
            )

        if (user.role == UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie można usunąć koordynatora"
            )
        }

        if (user.userGroups.isNotEmpty()){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie można usunąć użytkownika, który jest w grupie"
            )
        }

        if (user.points.isNotEmpty() || user.pointsByTeacher.isNotEmpty() || user.pointsByUpdatedBy.isNotEmpty()
            || user.pointsHistory.isNotEmpty() || user.pointsHistoryByTeacher.isNotEmpty()){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie można usunąć użytkownika, który jest ma przypisane punkty"
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
            reason = "Nieprawidłowe lub brakujące 'userId'"
        )

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != userId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko prowadzący i koordynatorzy mogą resetować hasła innym użytkownikom"
            )
        }

        val user = usersRepository.findByUserId(userId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono użytkownika o id $userId"
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
            reason = "Nieprawidłowe lub brakujące 'email'"
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
                reason = "Tylko koordynatorzy mogą dezaktywować wszystkich zdających studentów z edycji"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )

        if (edition.endDate.isAfter(java.time.LocalDate.now().plusDays(60))){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Można dezaktywować studentów z edycji tylko jeśli kończy się za 60 dni lub mniej"
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
                reason = "Tylko koordynatorzy mogą ustawić dezaktywować studenta"
            )
        }

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'userId'"
        )

        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono użytkownika o id $userId"
            )

        if (user.role != UsersRoles.STUDENT){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik nie jest studentem"
            )
        }

        if (!user.active){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik już jest dezaktywowany"
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
                reason = "Tylko koordynatorzy mogą ustawić aktywować studenta"
            )
        }

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'userId'"
        )

        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono użytkownika o id $userId"
            )

        if (user.role != UsersRoles.STUDENT){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik nie jest studentem"
            )
        }

        if (user.active){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik już jest aktywny"
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
                reason = "Tylko prowadzący i koordynatorzy mogą nadpisać ocenę studentowi"
            )
        }

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'userId'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val grade = arguments.getFloatField("grade") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'grade'"
        )

        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono użytkownika o id $userId"
            )
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )
        val userLevel = user.userLevels.find { it.edition == edition }
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik nie posiada poziomów w tej edycji"
            )
        // grade should be 2.0 or 3.0 or 3.5 or 4.0 or 4.5 or 5.0
        if (grade != 2.0f && grade != 3.0f && grade != 3.5f && grade != 4.0f && grade != 4.5f && grade != 5.0f){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nieprawidłowa ocena"
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
                reason = "Tylko prowadzący i koordynatorzy mogą przywrócić ocenę studentowi"
            )
        }

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'userId'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )


        val user = usersRepository.findById(userId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono użytkownika o id $userId"
            )
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )
        val userLevel = user.userLevels.find { it.edition == edition }
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik nie posiada poziomów w tej edycji"
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
            reason = "Nieprawidłowe lub brakujące 'studentId'"
        )

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != studentId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko prowadzący i koordynatorzy mogą oglądać punkty innych użytkowników"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val user = usersRepository.findById(studentId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono studenta o id $studentId"
            )
        if (user.role != UsersRoles.STUDENT) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik nie jest studentem"
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
                    reason = "Prowadzący może oglądać punkty tylko studentów z jego grup"
                )
            }
        }

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )
        if (user.userGroups.none { it.group.edition == edition }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student nie uczestniczy w tej edycji"
            )
        }
        val teacher = user.userGroups.firstOrNull { it.group.edition == edition }?.group?.teacher
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student nie ma przypisanego prowadzącego"
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
            reason = "Nieprawidłowe lub brakujące 'studentId'"
        )
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != studentId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko prowadzący i koordynatorzy mogą oglądać punkty innych użytkowników"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val user = usersRepository.findById(studentId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono studenta o id $studentId"
            )
        if (user.role != UsersRoles.STUDENT) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik nie jest studentem"
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
                    reason = "Prowadzący może oglądać punkty tylko studentów z jego grup"
                )
            }
        }

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )
        if (user.userGroups.none { it.group.edition == edition }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student nie uczestniczy w tej edycji"
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
                reason = "Tylko prowadzący i koordynatorzy mogą dodawać użytkowników"
            )
        }

        val indexNumberToSet = if (indexNumber == -1) {
            if (currentUser.role != UsersRoles.COORDINATOR) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Tylko koordynator może dodać prowadzącego"
                )
            }
            if (UsersRoles.valueOf(role.uppercase()) != UsersRoles.TEACHER) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Tylko prowadzącego można dodać z tym zapytaniem"
                )
            }
            if (email.isEmpty()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Email jest wymagany dla prowadzącego"
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
                    reason = "Nick nie jest wymagany dla prowadzącego"
                )
            }
            "$firstName.$secondName.$indexNumberToSet"
        } else {
            if (nick.isEmpty()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nick jest wymagany"
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
                    reason = "Tylko koordynatora można dodać tym zapytaniem z tym tokenem"
                )
            }
            if (usersRepository.existsByRole(UsersRoles.COORDINATOR)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Koordynator już istnieje"
                )
            }
        }

        if (UsersRoles.valueOf(role.uppercase()) == UsersRoles.COORDINATOR) {
            if (currentUser.userId != 0L) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Tylko koordynator może dodać koordynatora"
                )
            }
        }

        if (UsersRoles.valueOf(role.uppercase()) == UsersRoles.TEACHER) {
            if (currentUser.role != UsersRoles.COORDINATOR) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Tylko koordynator może dodać prowadzącego"
                )
            }
        }


        if (usersRepository.existsByIndexNumber(indexNumberToSet)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik o indeksie $indexNumberToSet już istnieje"
            )
        }
        if (usersRepository.findByNick(nickToBeSet) != null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik o nicku $nickToBeSet już istnieje"
            )
        }
        val userRole1 = try {
            UsersRoles.valueOf(role.uppercase())
        } catch (e: IllegalArgumentException) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nieprawidłowa rola"
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
                reason = "Nieprawidłowy email"
            )
        }

        if (usersRepository.existsByEmail(userEmail)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik z emailem $userEmail już istnieje"
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