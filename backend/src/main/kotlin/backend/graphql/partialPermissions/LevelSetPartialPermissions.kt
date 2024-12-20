package backend.graphql.partialPermissions

import backend.award.AwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.gradingChecks.GradingChecksRepository
import backend.graphql.utils.PhotoAssigner
import backend.groups.GroupsRepository
import backend.levelSet.LevelSet
import backend.levelSet.LevelSetRepository
import backend.levels.LevelsRepository
import backend.graphql.utils.Permission
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getLevelInputList
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.RoundingMode

@Service
class LevelSetPartialPermissions {

    @Autowired
    private lateinit var gradingChecksRepository: GradingChecksRepository

    @Autowired
    private lateinit var groupsRepository: GroupsRepository

    @Autowired
    private lateinit var levelSetRepository: LevelSetRepository

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

    fun checkCopyLevelSetPermission(arguments: JsonNode): Permission {
        val action = "copyLevelSet"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą kopiować zbiory poziomów"
            )
        }

        val levelSetId = arguments.getLongField("levelSetId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'levelSetId'"
        )

        val levelSet = levelSetRepository.findById(levelSetId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono zbioru poziomów o id $levelSetId"
            )

       // not validating further, as the levels are validated in checkAddLevelHelperPermission

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkEditLevelSetPermission(arguments: JsonNode): Permission {
        val action = "editLevelSet"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą edytować zbiory poziomów"
            )
        }

        val levelSetId = arguments.getLongField("levelSetId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'levelSetId'"
        )

        val levelSet = levelSetRepository.findById(levelSetId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono zbioru poziomów o id $levelSetId"
            )

        if (levelSet.edition.isNotEmpty()) {
            if (levelSet.edition.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja już się zakończyła"
                )
            }
            if (levelSet.edition.any { it.startDate.isBefore(java.time.LocalDate.now()) }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja już wystartowała"
                )
            }
        }

        if (levelSet.levels.any { it.userLevels.isNotEmpty() }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Zbiór poziomów zawiera poziomy przypisane użytkownikom"
            )
        }

        if (levelSet.levels.any { it.gradingChecks.isNotEmpty() }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Zbiór poziomów jest wykorzystywany w zasadach oceniania"
            )
        }

        // not validating further, as the levels are validated in checkEditLevelHelperPermission and checkAddLevelHelperPermission

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveLevelSetPermission(arguments: JsonNode): Permission {
        val action = "removeLevelSet"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą usuwać zbiory poziomów"
            )
        }

        val levelSetId = arguments.getLongField("levelSetId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'levelSetId'"
        )

        val levelSet = levelSetRepository.findById(levelSetId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono zbioru poziomów o id $levelSetId"
            )

        val levelsInSet = levelSet.levels.sortedBy { it.ordinalNumber }

        if (levelSet.edition.isNotEmpty()) {
            if (levelSet.edition.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja już się zakończyła"
                )
            }
            if (levelSet.edition.any { it.startDate.isBefore(java.time.LocalDate.now()) }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja już wystartowała"
                )
            }
            if (groupsRepository.findAll().any { it.edition.levelSet == levelSet }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Zbiór poziomów jest wykorzystywany w przez użytkowników w grupach"
                )
            }
        }

        if (levelSet.levels.any { it.gradingChecks.isNotEmpty() }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Zbiór poziomów jest wykorzystywany w zasadach oceniania"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddLevelSetToEditionPermission(arguments: JsonNode): Permission {
        val action = "addLevelSetToEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą dodawać zbiory poziomów do edycji"
            )
        }

        val levelSetId = arguments.getLongField("levelSetId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'levelSetId'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val levelSet = levelSetRepository.findById(levelSetId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono zbioru poziomów o id $levelSetId"
            )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )

        if (edition.endDate.isBefore(java.time.LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }


        if (edition.levelSet != null) {
            if (edition.levelSet!!.levelSetId == levelSetId) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja zawiera ten zbiór poziomów"
                )
            }
            if (edition.levelSet!!.levels.any { level -> level.userLevels.any { it.edition == edition } }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Zbiór poziomów jest wykorzystywany przez użytkowników w tej edycji"
                )
            }
            if (edition.gradingChecks.any { it.endOfLabsLevelsThreshold.levelSet == edition.levelSet }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Zbiór poziomów jest wykorzystywany przez zasady oceniania w tej edycji"
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

    fun checkRemoveLevelSetFromEditionPermission(arguments: JsonNode): Permission {
        val action = "removeLevelSetFromEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą usuwać zbiory poziomów z edycji"
            )
        }

        val levelSetId = arguments.getLongField("levelSetId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'levelSetId'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val levelSet = levelSetRepository.findById(levelSetId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono zbioru poziomów o id $levelSetId"
            )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )

        if (edition.endDate.isBefore(java.time.LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }

        if (edition.startDate.isBefore(java.time.LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już wystartowała"
            )
        }

        if (edition.levelSet?.levelSetId != levelSetId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja nie zawiera tego zbioru poziomów"
            )
        }

        if (edition.gradingChecks.any { it.endOfLabsLevelsThreshold.levelSet == levelSet }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Zbiór poziomów jest wykorzystywany przez zasady oceniania w tej edycji"
            )
        }

        if (edition.levelSet != null) {
            if (edition.levelSet!!.levels.any { level -> level.userLevels.any { it.edition == edition } }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Zbiór poziomów jest wykorzystywany przez użytkowników w tej edycji"
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
}