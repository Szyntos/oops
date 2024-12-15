package backend.graphql

import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.PermissionDeniedException
import backend.graphql.utils.PermissionInput
import backend.graphql.utils.PermissionService
import backend.groups.GroupsRepository
import backend.levelSet.LevelSetRepository
import backend.levels.Levels
import backend.levels.LevelsRepository
import backend.points.PointsRepository
import backend.users.UsersRepository
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@DgsComponent
class LevelsDataFetcher {
    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var pointsRepository: PointsRepository

    @Autowired
    private lateinit var levelSetRepository: LevelSetRepository

    @Autowired
    private lateinit var groupsRepository: GroupsRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    lateinit var editionRepository: EditionRepository

    @Autowired
    lateinit var levelsRepository: LevelsRepository

    @Autowired
    lateinit var fileEntityRepository: FileEntityRepository

    @Autowired
    lateinit var photoAssigner: PhotoAssigner

    @Autowired
    lateinit var usersRepository: UsersRepository

    @DgsMutation
    @Transactional
    fun assignPhotoToLevel(@InputArgument levelId: Long, @InputArgument fileId: Long?): Boolean {
        val action = "assignPhotoToLevel"
        val arguments = mapOf(
            "levelId" to levelId,
            "fileId" to fileId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val level = levelsRepository.findById(levelId).orElseThrow { IllegalArgumentException("Invalid level ID") }

        return photoAssigner.assignPhotoToAssignee(levelsRepository, "image/level", levelId, fileId)
    }

    @DgsQuery
    @Transactional
    fun getNeighboringLevels(@InputArgument studentId: Long, @InputArgument editionId: Long): NeighboringLevelsType {
        val action = "getNeighboringLevels"
        val arguments = mapOf(
            "studentId" to studentId,
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val student = usersRepository.findById(studentId)
            .orElseThrow { IllegalArgumentException("Invalid student ID") }

        val userLevel = student.userLevels.find { it.edition == edition }
            ?: throw IllegalArgumentException("Student does not have a level in the edition")
        val currentLevel = userLevel.level
        val previousLevel =
            levelsRepository.findByLevelSet(currentLevel.levelSet)
                .firstOrNull { it.ordinalNumber == currentLevel.ordinalNumber - 1 }
        val nextLevel =
            levelsRepository.findByLevelSet(currentLevel.levelSet)
                .firstOrNull { it.ordinalNumber == currentLevel.ordinalNumber + 1 }
        val sumOfAllPoints = pointsRepository.findAllByStudent(student)
            .filter { it.subcategory.edition == edition }
            .sumOf { it.value }
        return NeighboringLevelsType(
            sumOfAllPoints = sumOfAllPoints,
            prevLevel = previousLevel,
            currLevel = currentLevel,
            nextLevel = nextLevel
        )
    }
}

data class NeighboringLevelsType(
    val sumOfAllPoints: BigDecimal,
    val prevLevel: Levels?,
    val currLevel: Levels,
    val nextLevel: Levels?
)
