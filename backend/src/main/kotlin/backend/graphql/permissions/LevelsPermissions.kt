package backend.graphql.permissions

import backend.award.AwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.graphql.utils.PhotoAssigner
import backend.levels.LevelsRepository
import backend.graphql.utils.Permission
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class LevelsPermissions {

    @Autowired
    private lateinit var usersRepository: UsersRepository

    @Autowired
    private lateinit var levelsRepository: LevelsRepository

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

    fun checkAssignPhotoToLevelPermission(arguments: JsonNode): Permission {
        val action = "assignPhotoToLevel"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can assign photos to levels"
            )
        }

        val levelId = arguments.getLongField("levelId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'levelId'"
        )

        val fileId = arguments.getLongField("fileId")

        val level = levelsRepository.findById(levelId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid level ID"
            )

        if (level.levelSet.edition.isNotEmpty()) {
            if (level.levelSet.edition.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition has already ended"
                )
            }
        }

        val permission = photoAssigner.checkAssignPhotoToAssigneePermission(levelsRepository, "image/level", levelId, fileId)
        if (!permission.allow) {
            return permission
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkGetNeighboringLevelsPermission(arguments: JsonNode): Permission {
        val action = "getNeighboringLevels"
        val currentUser = userMapper.getCurrentUser()

        val studentId = arguments.getLongField("studentId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'studentId'"
        )
        val student = usersRepository.findById(studentId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid student ID"
            )

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            if (currentUser.userId != studentId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Student can only get neighboring levels for themselves"
                )
            }
        }

        if (currentUser.role == UsersRoles.TEACHER){
            val teacherEditions = currentUser.userGroups.map { it.group.edition }
            val studentEditions = student.userGroups.map { it.group.edition }
            if (teacherEditions.intersect(studentEditions.toSet()).isEmpty()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only get neighboring levels for students in their editions"
                )
            }
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
        if (student.userGroups.none { it.group.edition == edition }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student is not in any group in the edition"
            )
        }
        val userLevel = student.userLevels.find { it.edition == edition }
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student does not have a level in the edition"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}