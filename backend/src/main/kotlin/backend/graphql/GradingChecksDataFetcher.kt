package backend.graphql

import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEditionRepository
import backend.edition.EditionRepository
import backend.gradingChecks.GradingChecks
import backend.gradingChecks.GradingChecksRepository
import backend.graphql.utils.*
import backend.graphql.permissions.GradingChecksPermissions
import backend.graphql.utils.PermissionDeniedException
import backend.graphql.utils.PermissionInput
import backend.graphql.utils.PermissionService
import backend.levels.Levels
import backend.levels.LevelsRepository
import backend.points.PointsRepository
import backend.users.Users
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import kotlin.jvm.optionals.getOrNull

@DgsComponent
class GradingChecksDataFetcher {
    @Autowired
    private lateinit var gradingChecksPermissions: GradingChecksPermissions

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

    @DgsQuery
    @Transactional
    fun listSetupGradingChecks(@InputArgument editionId: Long): GradingCheckWithPermissions {
        val action = "listSetupGradingChecks"
        val arguments = mapOf(
            "editionId" to editionId
        )

        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono edycji o id $editionId") }

        val gradingCheck = gradingChecksRepository.findByEdition(edition).getOrNull()

        val gradingCheckPermissions = GradingCheckWithPermissions(
            gradingCheck = gradingCheck,
            permissions = ListPermissionsOutput(
                canAdd = permissionService.checkPartialPermission(PermissionInput("addGradingCheck", objectMapper.writeValueAsString(mapOf("editionId" to editionId)))),
                canEdit = permissionService.checkPartialPermission(PermissionInput("editGradingCheck", objectMapper.writeValueAsString(mapOf("gradingCheckId" to gradingCheck?.gradingCheckId)))),
                canCopy =
                Permission(
                    "copyGradingCheck",
                    objectMapper.createObjectNode(),
                    false,
                    "Nie dotyczy"),
                canRemove = permissionService.checkPartialPermission(PermissionInput("removeGradingCheck", objectMapper.writeValueAsString(mapOf("gradingCheckId" to gradingCheck?.gradingCheckId)))),
                canSelect =
                Permission(
                    "selectGradingCheck",
                    objectMapper.createObjectNode(),
                    false,
                    "Nie dotyczy"),
                canUnselect =
                Permission(
                    "unselectGradingCheck",
                    objectMapper.createObjectNode(),
                    false,
                    "Nie dotyczy"),
                additional = emptyList()
            )
        )

        return gradingCheckPermissions
    }

    @DgsQuery
    @Transactional
    fun getQuoteVariables(@InputArgument editionId: Long): QuoteVariables {
        val action = "getQuoteVariables"
        val arguments = mapOf(
            "editionId" to editionId
        )

        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono edycji o id $editionId") }

        val coordinator = usersRepository.findByRole(UsersRoles.COORDINATOR)
            .firstOrNull()
            ?: throw IllegalArgumentException("Nie znaleziono koordynatora")

        val firstPassingLevel = edition.levelSet?.let {
            levelsRepository.findFirstByGradeAndLevelSetOrderByOrdinalNumber(3.0.toBigDecimal(), it)
        }
        return QuoteVariables(
            firstPassingLevel = firstPassingLevel,
            gradingCheck = gradingChecksRepository.findByEdition(edition).getOrNull(),
            coordinator = coordinator
        )
    }

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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono edycji o id $editionId") }

        val endOfLabsDateParsed = LocalDate.parse(endOfLabsDate)

        val endOfLabsLevelsThresholdLevel = levelsRepository.findById(endOfLabsLevelsThreshold)
            .orElseThrow { IllegalArgumentException("Nie znaleziono poziomu o id $endOfLabsLevelsThreshold") }

        val project = categoriesRepository.findById(projectId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono kategorii (projektu) o id $projectId") }

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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val gradingCheck = gradingChecksRepository.findById(gradingCheckId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono zasad oceniania o id $gradingCheckId") }

        endOfLabsDate?.let {
            gradingCheck.endOfLabsDate = LocalDate.parse(it)
        }

        endOfLabsLevelsThreshold?.let {
            val level = levelsRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Nie znaleziono poziomu o id $it") }
            gradingCheck.endOfLabsLevelsThreshold = level
        }

        projectPointsThreshold?.let {
            gradingCheck.projectPointsThreshold = it
        }

        projectId?.let {
            val project = categoriesRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Nie znaleziono kategorii (projektu) o id $projectId") }
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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        return removeGradingCheckHelper(gradingCheckId)
    }

    fun removeGradingCheckHelper(gradingCheckId: Long): Boolean {
        val permission = gradingChecksPermissions.checkRemoveGradingCheckHelperPermission(gradingCheckId)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val gradingCheck = gradingChecksRepository.findById(gradingCheckId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono zasad oceniania o id $gradingCheckId") }

        gradingChecksRepository.delete(gradingCheck)
        return true
    }

}

data class GradingCheckWithPermissions(
    val gradingCheck: GradingChecks?,
    val permissions: ListPermissionsOutput
)

data class QuoteVariables(
    val firstPassingLevel: Levels?,
    val gradingCheck: GradingChecks?,
    val coordinator: Users
)
