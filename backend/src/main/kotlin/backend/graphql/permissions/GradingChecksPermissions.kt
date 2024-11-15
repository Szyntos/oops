package backend.graphql.permissions

import backend.award.AwardRepository
import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEditionRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.gradingChecks.GradingChecksRepository
import backend.graphql.utils.PhotoAssigner
import backend.levels.LevelsRepository
import backend.graphql.utils.Permission
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getBooleanField
import backend.utils.JsonNodeExtensions.getFloatField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeParseException
import kotlin.jvm.optionals.getOrNull

@Service
class GradingChecksPermissions {

    @Autowired
    private lateinit var categoryEditionRepository: CategoryEditionRepository

    @Autowired
    private lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    private lateinit var levelsRepository: LevelsRepository

    @Autowired
    private lateinit var gradingChecksRepository: GradingChecksRepository

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

    fun checkListSetupGradingChecksPermission(arguments: JsonNode): Permission {
        val action = "listSetupGradingChecks"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User is not a coordinator"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val edition = editionRepository.findById(editionId).getOrNull()
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

    fun checkAddGradingCheckPermission(arguments: JsonNode): Permission {
        val action = "addGradingCheck"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User is not a coordinator"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val endOfLabsDate = arguments.getStringField("endOfLabsDate") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'endOfLabsDate'"
        )

        val endOfLabsLevelsThreshold = arguments.getLongField("endOfLabsLevelsThreshold") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'endOfLabsLevelsThreshold'"
        )

        val projectPointsThreshold = arguments.getFloatField("projectPointsThreshold") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'projectPointsThreshold'"
        )

        val projectId = arguments.getLongField("projectId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'projectId'"
        )

        val checkDates = arguments.getBooleanField("checkDates") ?: true


        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )

        if (gradingChecksRepository.existsByEdition(edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Grading checks for edition ${edition.editionName} already exist"
            )
        }

        val endOfLabsDateParsed = LocalDate.parse(endOfLabsDate)
        if (checkDates) {

            if (edition.endDate.isBefore(LocalDate.now())){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition has already ended"
                )
            }
            if (edition.startDate.isBefore(LocalDate.now())) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition has already started"
                )
            }
            if (endOfLabsDateParsed.isBefore(LocalDate.now())) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "End of labs date must be in the future"
                )
            }
        }

        if (endOfLabsDateParsed.isBefore(edition.startDate) || endOfLabsDateParsed.isAfter(edition.endDate)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "End of labs date must be between ${edition.startDate} and ${edition.endDate}"
            )
        }

        val endOfLabsLevelsThresholdLevel = levelsRepository.findById(endOfLabsLevelsThreshold).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid level ID"
            )

        val project = categoriesRepository.findById(projectId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid project ID"
            )

        if (categoryEditionRepository.findByCategoryAndEdition(project, edition).isEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Project ${project.categoryName} is not part of edition ${edition.editionName}"
            )
        }

        if (projectPointsThreshold < 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Project points threshold cannot be negative"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkEditGradingCheckPermission(arguments: JsonNode): Permission {
        val action = "editGradingCheck"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User is not a coordinator"
            )
        }


        val gradingCheckId = arguments.getLongField("gradingCheckId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'gradingCheckId'"
        )

        val gradingCheck = gradingChecksRepository.findById(gradingCheckId)
            .orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Grading check not found"
            )

        val edition = gradingCheck.edition

        if (edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition is already finished"
            )
        }

        if (edition.startDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already started"
            )
        }

        val endOfLabsDate = arguments.getStringField("endOfLabsDate")
        val endOfLabsLevelsThreshold = arguments.getLongField("endOfLabsLevelsThreshold")
        val projectPointsThreshold = arguments.getFloatField("projectPointsThreshold")
        val projectId = arguments.getLongField("projectId")

        endOfLabsDate?.let {
            val endOfLabsDateParsed = try {
                LocalDate.parse(it)
            } catch (e: DateTimeParseException) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid date format for endOfLabsDate"
                )
            }

            val edition = gradingCheck.edition

            if (edition.endDate.isBefore(LocalDate.now())) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition has already ended"
                )
            }
            if (endOfLabsDateParsed.isBefore(LocalDate.now())) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "End of labs date must be in the future"
                )
            }

            if (endOfLabsDateParsed.isBefore(edition.startDate) || endOfLabsDateParsed.isAfter(edition.endDate)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "End of labs date must be between ${edition.startDate} and ${edition.endDate}"
                )
            }

            gradingCheck.endOfLabsDate = endOfLabsDateParsed
        }

        endOfLabsLevelsThreshold?.let {
            val level = levelsRepository.findById(it).orElse(null)
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid level ID"
                )
            gradingCheck.endOfLabsLevelsThreshold = level
        }

        projectPointsThreshold?.let {
            if (it < 0) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Project points threshold cannot be negative"
                )
            }

            gradingCheck.projectPointsThreshold = it
        }

        projectId?.let {
            val project = categoriesRepository.findById(it).orElse(null)
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid project ID"
                )

            if (categoryEditionRepository.findByCategoryAndEdition(project, gradingCheck.edition).isEmpty()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Project ${project.categoryName} is not part of edition ${gradingCheck.edition.editionName}"
                )
            }
            gradingCheck.project = project
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveGradingCheckPermission(arguments: JsonNode): Permission {
        val action = "removeGradingCheck"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User is not a coordinator"
            )
        }

        val gradingCheckId = arguments.getLongField("gradingCheckId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'gradingCheckId'"
        )

        val gradingCheck = gradingChecksRepository.findById(gradingCheckId)
            .orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Grading check not found"
            )

        if (gradingCheck.edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveGradingCheckHelperPermission(gradingCheckId: Long): Permission{
        val action = "removeGradingCheckHelper"
        val arguments = objectMapper.valueToTree<JsonNode>(
            mapOf(
                "gradingCheckId" to gradingCheckId
            )
        )
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User is not a coordinator"
            )
        }

        val gradingCheckId = arguments.getLongField("gradingCheckId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'gradingCheckId'"
        )

        val gradingCheck = gradingChecksRepository.findById(gradingCheckId)
            .orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Grading check not found"
            )

        if (gradingCheck.edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}