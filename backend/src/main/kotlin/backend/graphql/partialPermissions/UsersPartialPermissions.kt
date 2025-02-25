package backend.graphql.partialPermissions

import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.utils.PhotoAssigner
import backend.groups.GroupsRepository
import backend.graphql.utils.Permission
import backend.userLevel.UserLevelRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getBooleanField
import backend.utils.JsonNodeExtensions.getFloatField
import backend.utils.JsonNodeExtensions.getIntField
import backend.utils.JsonNodeExtensions.getIntList
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import kotlin.jvm.optionals.getOrNull

@Service
class UsersPartialPermissions {
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


    fun checkEditUserPermission(arguments: JsonNode): Permission {
        val action = "editUser"
        val currentUser = userMapper.getCurrentUser()

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

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            if (currentUser.userId != userId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Studenci mogę jedynie edytować samych siebie"
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
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą nadpisać ocenę studenta"
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

    fun checkTurnOffOverrideComputedGradeForUserPermission(arguments: JsonNode): Permission {
        val action = "turnOffOverrideComputedGradeForUser"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą przywrócić ocenę studenta"
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
}