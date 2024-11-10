package backend.graphql

import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEditionRepository
import backend.edition.EditionRepository
import backend.gradingChecks.GradingChecks
import backend.gradingChecks.GradingChecksRepository
import backend.graphql.utils.PermissionDeniedException
import backend.graphql.utils.PermissionInput
import backend.graphql.utils.PermissionService
import backend.levels.LevelsRepository
import backend.points.PointsRepository
import backend.users.UsersRepository
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@DgsComponent
class GradingChecksDataFetcher {
    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var levelsRepository: LevelsRepository

    @Autowired
    private lateinit var editionRepository: EditionRepository

    @Autowired
    private lateinit var categoryEditionRepository: CategoryEditionRepository

    @Autowired
    lateinit var usersRepository: UsersRepository

    @Autowired
    lateinit var pointsRepository: PointsRepository

    @Autowired
    lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    lateinit var gradingChecksRepository: GradingChecksRepository

    @DgsMutation
    @Transactional
    fun addGradingCheck(@InputArgument editionId: Long, @InputArgument endOfLabsDate: String,
                        @InputArgument endOfLabsLevelsThreshold: Long, @InputArgument projectPointsThreshold: Float,
                        @InputArgument projectId: Long, @InputArgument checkDates: Boolean = true): GradingChecks {
        val action = "addGradingCheck"
        val arguments = mapOf(
            "editionId" to editionId,
            "endOfLabsDate" to endOfLabsDate,
            "endOfLabsLevelsThreshold" to endOfLabsLevelsThreshold,
            "projectPointsThreshold" to projectPointsThreshold,
            "projectId" to projectId,
            "checkDates" to checkDates
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

        val endOfLabsDateParsed = LocalDate.parse(endOfLabsDate)

        val endOfLabsLevelsThresholdLevel = levelsRepository.findById(endOfLabsLevelsThreshold)
            .orElseThrow { IllegalArgumentException("Invalid level ID") }

        val project = categoriesRepository.findById(projectId)
            .orElseThrow { IllegalArgumentException("Invalid project ID") }

        val gradingCheck = GradingChecks(
            endOfLabsDate = endOfLabsDateParsed,
            endOfLabsLevelsThreshold = endOfLabsLevelsThresholdLevel,
            projectPointsThreshold = projectPointsThreshold,
            project = project,
            edition = edition
        )

        return gradingChecksRepository.save(gradingCheck)
    }

    @DgsMutation
    @Transactional
    fun editGradingCheck(
        @InputArgument gradingCheckId: Long,
        @InputArgument endOfLabsDate: String?,
        @InputArgument endOfLabsLevelsThreshold: Long?,
        @InputArgument projectPointsThreshold: Float?,
        @InputArgument projectId: Long?
    ): GradingChecks {
        val action = "editGradingCheck"
        val arguments = mapOf(
            "gradingCheckId" to gradingCheckId,
            "endOfLabsDate" to endOfLabsDate,
            "endOfLabsLevelsThreshold" to endOfLabsLevelsThreshold,
            "projectPointsThreshold" to projectPointsThreshold,
            "projectId" to projectId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val gradingCheck = gradingChecksRepository.findById(gradingCheckId)
            .orElseThrow { IllegalArgumentException("Grading check not found") }

        endOfLabsDate?.let {
            gradingCheck.endOfLabsDate = LocalDate.parse(it)
        }

        endOfLabsLevelsThreshold?.let {
            val level = levelsRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Invalid level ID") }
            gradingCheck.endOfLabsLevelsThreshold = level
        }

        projectPointsThreshold?.let {
            gradingCheck.projectPointsThreshold = it
        }

        projectId?.let {
            val project = categoriesRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Invalid project ID") }
            gradingCheck.project = project
        }

        return gradingChecksRepository.save(gradingCheck)
    }

    @DgsMutation
    @Transactional
    fun removeGradingCheck(@InputArgument gradingCheckId: Long): Boolean {
        val action = "removeGradingCheck"
        val arguments = mapOf(
            "gradingCheckId" to gradingCheckId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val gradingCheck = gradingChecksRepository.findById(gradingCheckId)
            .orElseThrow { IllegalArgumentException("Grading check not found") }

        gradingChecksRepository.delete(gradingCheck)
        return true
    }

}

