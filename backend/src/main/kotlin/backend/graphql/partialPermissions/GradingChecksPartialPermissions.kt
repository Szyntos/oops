package backend.graphql.partialPermissions

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
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeParseException
import kotlin.jvm.optionals.getOrNull

@Service
class GradingChecksPartialPermissions {

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

        if (edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

//        if (edition.startDate.isBefore(LocalDate.now())) {
//            return Permission(
//                action = action,
//                arguments = arguments,
//                allow = false,
//                reason = "Edition has already started"
//            )
//        }


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
                reason = "Edition has already ended"
            )
        }

//        if (edition.startDate.isBefore(LocalDate.now())) {
//            return Permission(
//                action = action,
//                arguments = arguments,
//                allow = false,
//                reason = "Edition has already started"
//            )
//        }

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
}