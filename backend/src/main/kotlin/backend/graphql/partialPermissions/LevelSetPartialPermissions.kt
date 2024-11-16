package backend.graphql.partialPermissions

import backend.award.AwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
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
                reason = "Only coordinators can copy level sets"
            )
        }

        val levelSetId = arguments.getLongField("levelSetId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'levelSetId'"
        )

        val levelSet = levelSetRepository.findById(levelSetId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid level set ID"
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
                reason = "Only coordinators can edit level sets"
            )
        }

        val levelSetId = arguments.getLongField("levelSetId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'levelSetId'"
        )

        val levelSet = levelSetRepository.findById(levelSetId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid level set ID"
            )

        if (levelSet.edition.isNotEmpty()) {
            if (levelSet.edition.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition has already ended"
                )
            }
            if (levelSet.edition.any { it.startDate.isBefore(java.time.LocalDate.now()) }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition has already started"
                )
            }
        }

        if (levelSet.levels.any { it.userLevels.isNotEmpty() }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Level set has users assigned to it"
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
                reason = "Only coordinators can remove level sets"
            )
        }

        val levelSetId = arguments.getLongField("levelSetId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'levelSetId'"
        )

        val levelSet = levelSetRepository.findById(levelSetId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid level set ID"
            )

        val levelsInSet = levelSet.levels.sortedBy { it.ordinalNumber }

        if (levelSet.edition.isNotEmpty()) {
            if (levelSet.edition.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition has already ended"
                )
            }
            if (levelSet.edition.any { it.startDate.isBefore(java.time.LocalDate.now()) }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition has already started"
                )
            }
            if (groupsRepository.findAll().any { it.edition.levelSet == levelSet }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "There are groups using the level set"
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

    fun checkAddLevelSetToEditionPermission(arguments: JsonNode): Permission {
        val action = "addLevelSetToEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add level sets to edition"
            )
        }

        val levelSetId = arguments.getLongField("levelSetId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'levelSetId'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val levelSet = levelSetRepository.findById(levelSetId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid level set ID"
            )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )

        if (edition.endDate.isBefore(java.time.LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }


        if (edition.levelSet != null) {
            if (edition.levelSet!!.levelSetId == levelSetId) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition already has the level set"
                )
            }
            if (edition.levelSet!!.levels.any { level -> level.userLevels.any { it.edition == edition } }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition already has users assigned to the selected level set"
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
                reason = "Only coordinators can remove level sets from edition"
            )
        }

        val levelSetId = arguments.getLongField("levelSetId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'levelSetId'"
        )

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val levelSet = levelSetRepository.findById(levelSetId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid level set ID"
            )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )

        if (edition.endDate.isBefore(java.time.LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        if (edition.startDate.isBefore(java.time.LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already started"
            )
        }

        if (edition.levelSet?.levelSetId != levelSetId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition does not have the level set"
            )
        }

        if (edition.levelSet != null) {
            if (edition.levelSet!!.levels.any { level -> level.userLevels.any { it.edition == edition } }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition already has users assigned to the selected level set"
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