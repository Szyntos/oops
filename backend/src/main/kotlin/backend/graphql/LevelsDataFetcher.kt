package backend.graphql

import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.groups.GroupsRepository
import backend.levelSet.LevelSet
import backend.levelSet.LevelSetRepository
import backend.levels.Levels
import backend.levels.LevelsRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode

@DgsComponent
class LevelsDataFetcher {
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can assign photos to levels")
        }

        val level = levelsRepository.findById(levelId).orElseThrow { IllegalArgumentException("Invalid level ID") }

        if (level.levelSet.edition.isNotEmpty()) {
            if (level.levelSet.edition.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
                throw IllegalArgumentException("Edition has already ended")
            }
        }

        return photoAssigner.assignPhotoToAssignee(levelsRepository, "image/level", levelId, fileId)
    }

    @DgsQuery
    @Transactional
    fun getNeighboringLevels(@InputArgument studentId: Long, @InputArgument editionId: Long): NeighboringLevelsType {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            if (currentUser.userId != studentId){
                throw IllegalArgumentException("Student can only get neighboring levels for themselves")
            }
        }
        if (currentUser.role == UsersRoles.TEACHER){
            val student = usersRepository.findById(studentId)
                .orElseThrow { IllegalArgumentException("Invalid student ID") }
            val teacherEditions = currentUser.userGroups.map { it.group.edition }
            val studentEditions = student.userGroups.map { it.group.edition }
            if (teacherEditions.intersect(studentEditions.toSet()).isEmpty()){
                throw IllegalArgumentException("Teacher can only get neighboring levels for students in their editions")
            }
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val student = usersRepository.findById(studentId)
            .orElseThrow { IllegalArgumentException("Invalid student ID") }
        if (student.userGroups.none { it.group.edition == edition }){
            throw IllegalArgumentException("Student is not in any group in the edition")
        }
        val userLevel = student.userLevels.find { it.edition == edition }
            ?: throw IllegalArgumentException("Student does not have a level in the edition")
        val currentLevel = userLevel.level
        val previousLevel =
            levelsRepository.findByLevelSet(currentLevel.levelSet)
                .firstOrNull { it.ordinalNumber == currentLevel.ordinalNumber - 1 }
        val nextLevel =
            levelsRepository.findByLevelSet(currentLevel.levelSet)
                .firstOrNull { it.ordinalNumber == currentLevel.ordinalNumber + 1 }
        return NeighboringLevelsType(
            prevLevel = previousLevel,
            currLevel = currentLevel,
            nextLevel = nextLevel
        )
    }
}

data class NeighboringLevelsType(
    val prevLevel: Levels?,
    val currLevel: Levels,
    val nextLevel: Levels?
)
