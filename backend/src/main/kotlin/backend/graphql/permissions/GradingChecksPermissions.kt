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
                reason = "Użytkownik nie jest koordynatorem"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val edition = editionRepository.findById(editionId).getOrNull()
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

    fun checkGetQuoteVariablesPermission(arguments: JsonNode): Permission {
        val action = "getQuoteVariables"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik nie jest koordynatorem"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
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
                reason = "Użytkownik nie jest koordynatorem"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val endOfLabsDate = arguments.getStringField("endOfLabsDate") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'endOfLabsDate'"
        )

        val endOfLabsLevelsThreshold = arguments.getLongField("endOfLabsLevelsThreshold") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'endOfLabsLevelsThreshold'"
        )

        val projectPointsThreshold = arguments.getFloatField("projectPointsThreshold") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'projectPointsThreshold'"
        )

        val projectId = arguments.getLongField("projectId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'projectId'"
        )

        val checkDates = arguments.getBooleanField("checkDates") ?: true


        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )

        if (gradingChecksRepository.existsByEdition(edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już zawiera zasady oceniania"
            )
        }

        val endOfLabsDateParsed = LocalDate.parse(endOfLabsDate)
        if (checkDates) {

            if (edition.endDate.isBefore(LocalDate.now())){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja już się zakończyła"
                )
            }
//            if (edition.startDate.isBefore(LocalDate.now())) {
//                return Permission(
//                    action = action,
//                    arguments = arguments,
//                    allow = false,
//                    reason = "Edycja już wystartowała"
//                )
//            }
//            if (endOfLabsDateParsed.isBefore(LocalDate.now())) {
//                return Permission(
//                    action = action,
//                    arguments = arguments,
//                    allow = false,
//                    reason = "End of labs date must be in the future"
//                )
//            }
        }

        if (endOfLabsDateParsed.isBefore(edition.startDate) || endOfLabsDateParsed.isAfter(edition.endDate)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Koniec laboratoriów musi być pomiędzy ${edition.startDate} a ${edition.endDate}"
            )
        }

        val endOfLabsLevelsThresholdLevel = levelsRepository.findById(endOfLabsLevelsThreshold).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono poziomu o id $endOfLabsLevelsThreshold"
            )

        val project = categoriesRepository.findById(projectId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono kategorii (projektu) o id $projectId"
            )

        if (categoryEditionRepository.findByCategoryAndEdition(project, edition).isEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Projekt ${project.categoryName} nie jest częścią edycji ${edition.editionName}"
            )
        }

        if (projectPointsThreshold < 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Pułap punktów projektu nie może być ujemny"
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
                reason = "Użytkownik nie jest koordynatorem"
            )
        }


        val gradingCheckId = arguments.getLongField("gradingCheckId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'gradingCheckId'"
        )

        val gradingCheck = gradingChecksRepository.findById(gradingCheckId)
            .orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono zasad oceniania o id $gradingCheckId"
            )

        val edition = gradingCheck.edition

        if (edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }

//        if (edition.startDate.isBefore(LocalDate.now())) {
//            return Permission(
//                action = action,
//                arguments = arguments,
//                allow = false,
//                reason = "Edycja już wystartowała"
//            )
//        }

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
                    reason = "Nieprawidłowy format daty dla endOfLabsDate"
                )
            }

            val edition = gradingCheck.edition

            if (edition.endDate.isBefore(LocalDate.now())) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja już się zakończyła"
                )
            }
//            if (endOfLabsDateParsed.isBefore(LocalDate.now())) {
//                return Permission(
//                    action = action,
//                    arguments = arguments,
//                    allow = false,
//                    reason = "End of labs date must be in the future"
//                )
//            }

            if (endOfLabsDateParsed.isBefore(edition.startDate) || endOfLabsDateParsed.isAfter(edition.endDate)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Koniec laboratoriów musi być pomiędzy ${edition.startDate} a ${edition.endDate}"
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
                    reason = "Nie znaleziono poziomu o id $it"
                )
            gradingCheck.endOfLabsLevelsThreshold = level
        }

        projectPointsThreshold?.let {
            if (it < 0) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Pułap punktów projektu nie może być ujemny"
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
                    reason = "Nie znaleziono kategorii (projektu) o id $projectId"
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
                reason = "Użytkownik nie jest koordynatorem"
            )
        }

        val gradingCheckId = arguments.getLongField("gradingCheckId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'gradingCheckId'"
        )

        val gradingCheck = gradingChecksRepository.findById(gradingCheckId)
            .orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono zasad oceniania o id $gradingCheckId"
            )

        if (gradingCheck.edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
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
                reason = "Użytkownik nie jest koordynatorem"
            )
        }

        val gradingCheckId = arguments.getLongField("gradingCheckId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'gradingCheckId'"
        )

        val gradingCheck = gradingChecksRepository.findById(gradingCheckId)
            .orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono zasad oceniania o id $gradingCheckId"
            )

        if (gradingCheck.edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
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