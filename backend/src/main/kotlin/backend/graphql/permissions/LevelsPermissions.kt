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
                reason = "Tylko koordynatorzy mogą przypisywać zdjęcia do poziomów"
            )
        }

        val levelId = arguments.getLongField("levelId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'levelId'"
        )

        val fileId = arguments.getLongField("fileId")

        val level = levelsRepository.findById(levelId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono poziomu o id $levelId"
            )

        if (level.levelSet.edition.isNotEmpty()) {
            if (level.levelSet.edition.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja już się zakończyła"
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
            reason = "Nieprawidłowe lub brakujące 'studentId'"
        )
        val student = usersRepository.findById(studentId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono studenta o id $studentId"
            )

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            if (currentUser.userId != studentId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Student może uzyskać sąsiednie poziomy tylko dla siebie"
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
                    reason = "Prowadzący może uzyskać sąsiednie poziomy tylko dla studentów w swoich edycjach"
                )
            }
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
        if (student.userGroups.none { it.group.edition == edition }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student nie jest w żadnej grupie w edycji"
            )
        }
        val userLevel = student.userLevels.find { it.edition == edition }
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student ${student.userId} nie posiada poziomu w edycji $edition.editionId"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}