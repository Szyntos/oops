package backend.graphql.permissions

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
class LevelSetPermissions {

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

    fun checkListSetupLevelSetsPermission(arguments: JsonNode): Permission{
        val action = "listSetupLevelSets"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can list setup level sets"
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

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddLevelSetPermission(arguments: JsonNode): Permission {
        val action = "addLevelSet"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add level sets"
            )
        }

        val levels = arguments.getLevelInputList("levels") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'levels'"
        )

        // not validating further, as the levels are validated in checkAddLevelHelperPermission

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

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
            if (groupsRepository.findAll().any { it.edition.levelSet == levelSet }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "There are groups using the level set"
                )
            }
        }

        val levels = arguments.getLevelInputList("levels") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'levels'"
        )

        if (levelSet.levels.any { it.userLevels.isNotEmpty() }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Level set has users assigned to it"
            )
        }

        if (levelSet.levels.any { it.gradingChecks.isNotEmpty() }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Level set has grading checks using it"
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

        if (levelSet.levels.any { it.gradingChecks.isNotEmpty() }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Level set has grading checks using it"
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

            if (edition.gradingChecks.any { it.endOfLabsLevelsThreshold.levelSet == edition.levelSet }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition has grading checks using the selected level set"
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

        if (edition.gradingChecks.any { it.endOfLabsLevelsThreshold.levelSet == levelSet }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has grading checks using the level set"
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

    fun checkAddLevelHelperPermission(
        levelSet: LevelSet,
        name: String,
        maximumPoints: Double,
        grade: Double,
        imageFileId: Long? = null,
        ordinalNumber: Int? = null
    ): Permission {
        val action = "addLevelHelper"
        val levelSetMap = objectMapper.valueToTree<JsonNode>(
            mapOf(
                "levelSetId" to levelSet.levelSetId,
                "levelSetName" to levelSet.levelSetName
            )
        )
        val arguments = objectMapper.valueToTree<JsonNode>(
            mapOf(
                "levelSet" to levelSetMap,
                "name" to name,
                "maximumPoints" to maximumPoints,
                "grade" to grade,
                "imageFileId" to imageFileId,
                "ordinalNumber" to ordinalNumber
            )
        )
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add levels"
            )
        }
        // Not validating further, as the levels are validated in addLevelHelper

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkEditLevelHelperPermission(
        levelId: Long,
        name: String?,
        maximumPoints: Double?,
        grade: Double?,
        imageFileId: Long?,
        ordinalNumber: Int?,
        label: String?
    ): Permission {
        val action = "editLevelHelper"
        val arguments = objectMapper.valueToTree<JsonNode>(
            mapOf(
                "levelId" to levelId,
                "name" to name,
                "maximumPoints" to maximumPoints,
                "grade" to grade,
                "imageFileId" to imageFileId,
                "ordinalNumber" to ordinalNumber,
                "label" to label
            )
        )
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can edit levels"
            )
        }

        val level = levelsRepository.findById(levelId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid level ID"
            )

        if (level.levelSet.edition.isNotEmpty()) {
            if (level.levelSet.edition.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition has already ended"
                )
            }
            if (level.levelSet.edition.any { it.startDate.isBefore(java.time.LocalDate.now()) }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition has already started"
                )
            }
        }

        name?.let { newName ->
            if (levelsRepository.findByLevelSet(level.levelSet).any { level -> level.levelName == newName && level.levelId != levelId }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Level with the same name already exists in the edition"
                )
            }
            level.levelName = newName
        }

        val previousLevel =
            levelsRepository.findByLevelSet(level.levelSet)
                .firstOrNull { it.ordinalNumber == level.ordinalNumber - 1 }

        val nextLevel =
            levelsRepository.findByLevelSet(level.levelSet)
                .firstOrNull { it.ordinalNumber == level.ordinalNumber + 1 }

        maximumPoints?.let {
            if (it <= 0) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Maximum points must be a positive value"
                )
            }
            if (previousLevel != null && previousLevel.maximumPoints >= it.toBigDecimal()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Maximum points must be higher than the previous level"
                )
            }
            if (nextLevel != null && nextLevel.maximumPoints <= it.toBigDecimal()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Maximum points must be lower than the next level"
                )
            }
            level.maximumPoints = it.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        grade?.let {
            if (it < 0) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Grade must be a non-negative value"
                )
            }
            if (previousLevel != null && previousLevel.grade > it.toBigDecimal()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Grade must be higher or equal to the previous level"
                )
            }
            if (nextLevel != null && nextLevel.grade < it.toBigDecimal()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Grade must be lower or equal to the next level"
                )
            }
            level.grade = it.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        imageFileId?.let {
            val permission = photoAssigner.checkAssignPhotoToAssigneePermission(levelsRepository, "image/level", levelId, imageFileId)
            if (!permission.allow){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = permission.reason
                )
            }
        }

        nextLevel?.let {
            nextLevel.minimumPoints = level.maximumPoints
            levelsRepository.save(nextLevel)
        }

        ordinalNumber?.let {
            if (ordinalNumber < 0){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Ordinal number must be a non-negative value"
                )
            }
            val levelsInSet = levelsRepository.findByLevelSet(level.levelSet)
            if (ordinalNumber >= levelsInSet.size){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Ordinal number must be lower than the number of levels in the set"
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