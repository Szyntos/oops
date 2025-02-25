package backend.graphql

import backend.edition.Edition
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.permissions.LevelSetPermissions
import backend.graphql.utils.*
import backend.groups.GroupsRepository
import backend.levelSet.LevelSet
import backend.levelSet.LevelSetRepository
import backend.levels.Levels
import backend.levels.LevelsRepository
import backend.users.UsersRepository
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import jakarta.persistence.*
import org.slf4j.event.Level
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode

@DgsComponent
class LevelSetDataFetcher {
    @Autowired
    private lateinit var levelSetPermissions: LevelSetPermissions

    @Autowired
    private lateinit var permissionService: PermissionService

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

    @DgsQuery
    @Transactional
    fun listSetupLevelSets(@InputArgument editionId: Long): List<LevelSetWithPermissions> {
        val action = "listSetupLevelSets"
        val arguments = mapOf(
            "editionId" to editionId
        )
        val input = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(input)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }
        val levelSets = levelSetRepository.findAll().map { levelSet ->
            LevelSetWithPermissions(
                levelSet = LevelSetOutput(
                    levelSetId = levelSet.levelSetId,
                    levelSetName = levelSet.levelSetName,
                    edition = levelSet.edition,
                    levels = levelSet.levels.sortedBy { it.ordinalNumber }.toSet()
                ),
                permissions = ListPermissionsOutput(
                    canAdd = Permission(
                        "addLevelSet",
                        objectMapper.createObjectNode(),
                        false,
                        "Nie dotyczy"),
                    canEdit = permissionService.checkPartialPermission(PermissionInput("editLevelSet", objectMapper.writeValueAsString(mapOf("levelSetId" to levelSet.levelSetId)))),
                    canCopy = permissionService.checkPartialPermission(PermissionInput("copyLevelSet", objectMapper.writeValueAsString(mapOf("levelSetId" to levelSet.levelSetId)))),
                    canRemove = permissionService.checkPartialPermission(PermissionInput("removeLevelSet", objectMapper.writeValueAsString(mapOf("levelSetId" to levelSet.levelSetId)))),
                    canSelect = permissionService.checkPartialPermission(PermissionInput("addLevelSetToEdition", objectMapper.writeValueAsString(mapOf("levelSetId" to levelSet.levelSetId, "editionId" to editionId)))),
                    canUnselect = permissionService.checkPartialPermission(PermissionInput("removeLevelSetFromEdition", objectMapper.writeValueAsString(mapOf("levelSetId" to levelSet.levelSetId, "editionId" to editionId)))),
                    additional = emptyList()
                )
            )
        }.sortedBy { it.levelSet.levelSetId }

        return levelSets
    }


    @DgsMutation
    @Transactional
    fun addLevelSet(@InputArgument levels: List<LevelInput>): LevelSet{
        val action = "addLevelSet"
        val levelsMap = levels.map { level ->
            mapOf(
                "levelId" to level.levelId,
                "name" to level.name,
                "maximumPoints" to level.maximumPoints,
                "grade" to level.grade,
                "imageFileId" to level.imageFileId
            )
        }
        val arguments = mapOf(
            "levels" to levelsMap
        )
        val input = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(input)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val levelSet = levelSetRepository.save(LevelSet(levelSetName = ""))

        val levelsInSet = mutableListOf<Levels>()
        levels.sortedBy { it.maximumPoints }.forEachIndexed { index, levelInput ->
            val level = addLevelHelper(
                levelSet = levelSet,
                name = levelInput.name,
                maximumPoints = levelInput.maximumPoints,
                grade = levelInput.grade,
                imageFileId = levelInput.imageFileId,
                ordinalNumber = index
            )
            levelsInSet += level
        }
        return levelSet
    }

    @DgsMutation
    @Transactional
    fun copyLevelSet(@InputArgument levelSetId: Long): LevelSet {

        val action = "copyLevelSet"
        val arguments = mapOf(
            "levelSetId" to levelSetId
        )
        val input = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(input)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }


        val levelSet = levelSetRepository.findById(levelSetId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono zbioru poziomów o id $levelSetId") }

        val levelsInSet = levelSet.levels.sortedBy { it.ordinalNumber }

        val newLevelSet = levelSetRepository.save(LevelSet(levelSetName = ""))

        val newLevels = mutableListOf<Levels>()
        levelsInSet.sortedBy { it.maximumPoints }.forEachIndexed { index, level ->
            newLevels +=
                addLevelHelper(
                    name = level.levelName,
                    levelSet = newLevelSet,
                    maximumPoints = level.maximumPoints.toDouble(),
                    grade = level.grade.toDouble(),
                    imageFileId = level.imageFile?.fileId,
                    ordinalNumber = index
                )
        }
        return newLevelSet
    }

    @DgsMutation
    @Transactional
    fun editLevelSet(@InputArgument levelSetId: Long, @InputArgument levels: List<LevelInput>): LevelSet {
        val action = "editLevelSet"
        val levelsMap = levels.map { level ->
            mapOf(
                "levelId" to level.levelId,
                "name" to level.name,
                "maximumPoints" to level.maximumPoints,
                "grade" to level.grade,
                "imageFileId" to level.imageFileId
            )
        }
        val arguments = mapOf(
            "levelSetId" to levelSetId,
            "levels" to levelsMap
        )
        val input = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(input)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }


        val levelSet = levelSetRepository.findById(levelSetId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono zbioru poziomów o id $levelSetId") }

        val levelsInSet = levelSet.levels.sortedBy { it.ordinalNumber }
        val inputLevelIds = levels.mapNotNull { it.levelId }.toSet()

        // Remove levels not in input list
        levelsInSet.filter { it.levelId !in inputLevelIds }
            .forEach { levelNotInSet ->
                val level = levelsRepository.findById(levelNotInSet.levelId)
                    .orElseThrow { IllegalArgumentException("Nie znaleziono poziomu o id ${levelNotInSet.levelId}") }

                if (level.highest) {
                    val prevLevel = levelsRepository.findByLevelSet(levelSet)
                        .firstOrNull { it.ordinalNumber == level.ordinalNumber - 1 }
                    if (prevLevel != null) {
                        prevLevel.highest = true
                        levelsRepository.save(prevLevel)
                    }
                }
                if (level.userLevels.isNotEmpty()) {
                    throw IllegalArgumentException("Nie można usunąć poziomu z przypisanymi studentami")
                }
                levelsRepository.delete(level)
                levelSet.levels = levelSet.levels.filter { it.levelId != level.levelId }.toSet()
            }

        levels.sortedBy { it.maximumPoints }.forEachIndexed { index, levelInput ->
            val levelId = levelInput.levelId
            if (levelId != null && levelId > 0) {
                editLevelHelper(
                    levelId = levelId,
                    name = levelInput.name,
                    maximumPoints = levelInput.maximumPoints,
                    grade = levelInput.grade,
                    imageFileId = levelInput.imageFileId,
                    label = "",
                    ordinalNumber = index
                )
            } else {
                addLevelHelper(
                    name = levelInput.name,
                    levelSet = levelSet,
                    maximumPoints = levelInput.maximumPoints,
                    grade = levelInput.grade,
                    imageFileId = levelInput.imageFileId,
                    ordinalNumber = index
                )
            }
        }
        return levelSet
    }

    @DgsMutation
    @Transactional
    fun removeLevelSet(@InputArgument levelSetId: Long): Boolean {
        val action = "removeLevelSet"
        val arguments = mapOf(
            "levelSetId" to levelSetId
        )
        val input = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(input)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val levelSet = levelSetRepository.findById(levelSetId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono zbioru poziomów o id $levelSetId") }

        val levelsInSet = levelSet.levels.sortedBy { it.ordinalNumber }

        levelsInSet.forEach { level ->
            levelsRepository.delete(level)
        }
        levelSet.edition.forEach { it.levelSet = null }
        levelSetRepository.delete(levelSet)
        return true
    }

    @DgsMutation
    @Transactional
    fun addLevelSetToEdition(@InputArgument levelSetId: Long, @InputArgument editionId: Long): LevelSet {
        val action = "addLevelSetToEdition"

        val arguments = mapOf(
            "levelSetId" to levelSetId,
            "editionId" to editionId
        )
        val input = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(input)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }


        val levelSet = levelSetRepository.findById(levelSetId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono zbioru poziomów o id $levelSetId") }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono edycji o id $editionId") }

        levelSet.levelSetName = edition.editionName
        levelSetRepository.save(levelSet)
        edition.levelSet = levelSet
        editionRepository.save(edition)

        return levelSet
    }

    @DgsMutation
    @Transactional
    fun removeLevelSetFromEdition(@InputArgument levelSetId: Long, @InputArgument editionId: Long): Boolean {
        val action = "removeLevelSetFromEdition"

        val arguments = mapOf(
            "levelSetId" to levelSetId,
            "editionId" to editionId
        )
        val input = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(input)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val levelSet = levelSetRepository.findById(levelSetId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono zbioru poziomów o id $levelSetId") }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono edycji o id $editionId") }

        levelSet.levelSetName = ""
        levelSetRepository.save(levelSet)
        edition.levelSet = null
        editionRepository.save(edition)
        return true
    }

    @Transactional
    fun addLevelHelper(
        levelSet: LevelSet,
        name: String,
        maximumPoints: Double,
        grade: Double,
        imageFileId: Long? = null,
        ordinalNumber: Int? = null
    ): Levels {
        val permission = levelSetPermissions.checkAddLevelHelperPermission(levelSet, name, maximumPoints, grade, imageFileId, ordinalNumber)

        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val levelsInSet = levelSet.levels

        val highestLevel = levelsInSet.maxByOrNull { it.ordinalNumber }

        if (highestLevel == null){
            val level = Levels(
                levelName = name,
                minimumPoints = BigDecimal.ZERO,
                maximumPoints = maximumPoints.toBigDecimal().setScale(2, RoundingMode.HALF_UP),
                grade = grade.toBigDecimal().setScale(2, RoundingMode.HALF_UP),
                label = "",
                levelSet = levelSet
            )
            level.ordinalNumber = ordinalNumber ?: 0
            level.highest = true
            levelsRepository.save(level)
            photoAssigner.assignPhotoToAssignee(levelsRepository, "image/level", level.levelId, imageFileId)
            levelSet.levels += level
            return level
        }

        if (highestLevel.maximumPoints >= maximumPoints.toBigDecimal()){
            throw IllegalArgumentException("Maksymalna liczba punktów musi być większa od maksymalnej liczby punktów najwyższego poziomu w edycji")
        }
        if (highestLevel.grade > grade.toBigDecimal()){
            throw IllegalArgumentException("Ocena musi być większa lub równa ocenie najwyższego poziomu w edycji")
        }
        if (levelsInSet.any { it.levelName == name }){
            throw IllegalArgumentException("Nazwa poziomu musi być unikalna w ramach zbioru poziomów")
        }

        val level = Levels(
            levelName = name,
            levelSet = levelSet,
            minimumPoints = highestLevel.maximumPoints,
            maximumPoints = maximumPoints.toBigDecimal().setScale(2, RoundingMode.HALF_UP),
            grade = grade.toBigDecimal().setScale(2, RoundingMode.HALF_UP),
            label = "",
        )
        level.ordinalNumber = ordinalNumber ?: (highestLevel.ordinalNumber + 1)
        highestLevel.highest = false
        level.highest = true
        levelsRepository.save(level)
        photoAssigner.assignPhotoToAssignee(levelsRepository, "image/level", level.levelId, imageFileId)
        levelSet.levels += level
        return level
    }

    @Transactional
    fun editLevelHelper(
        levelId: Long,
        name: String?,
        maximumPoints: Double?,
        grade: Double?,
        imageFileId: Long?,
        ordinalNumber: Int?,
        label: String?
    ): Levels {
        val permission = levelSetPermissions.checkEditLevelHelperPermission(levelId, name, maximumPoints, grade, imageFileId, ordinalNumber, label)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }


        val level = levelsRepository.findById(levelId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono poziomu o id $levelId") }


        name?.let { newName ->
            level.levelName = newName
        }

        val previousLevel =
            levelsRepository.findByLevelSet(level.levelSet)
                .firstOrNull { it.ordinalNumber == level.ordinalNumber - 1 }

        val nextLevel =
            levelsRepository.findByLevelSet(level.levelSet)
                .firstOrNull { it.ordinalNumber == level.ordinalNumber + 1 }

        maximumPoints?.let {
            level.maximumPoints = it.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        grade?.let {
            level.grade = it.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        imageFileId?.let {
            photoAssigner.assignPhotoToAssignee(levelsRepository, "image/level", levelId, imageFileId)
        }

        label?.let {
            level.label = it
        }

        nextLevel?.let {
            nextLevel.minimumPoints = level.maximumPoints
            levelsRepository.save(nextLevel)
        }

        ordinalNumber?.let {
            if (ordinalNumber < 0){
                throw IllegalArgumentException("Liczba porządkowa nie może być ujemna")
            }
            val levelsInSet = levelsRepository.findByLevelSet(level.levelSet)
            if (ordinalNumber >= levelsInSet.size){
                throw IllegalArgumentException("Liczba porządkowa nie może być większa niż liczba poziomów w zbiorze")
            }
            val newOrdinalNumber = ordinalNumber.coerceAtMost(levelsInSet.size - 1)
            val levelsToShift = levelsInSet.filter { it.ordinalNumber in newOrdinalNumber..level.ordinalNumber }
            levelsToShift.forEach { it.ordinalNumber += 1 }
            level.ordinalNumber = newOrdinalNumber
            levelsToShift.forEach { levelsRepository.save(it) }
        }

        return levelsRepository.save(level)
    }
}

data class LevelInput(
    val levelId: Long? = null,
    val name: String,
    val maximumPoints: Double,
    val grade: Double,
    val imageFileId: Long? = null
)

data class LevelSetWithPermissions(
    val levelSet: LevelSetOutput,
    val permissions: ListPermissionsOutput
)

data class LevelSetOutput(
    val levelSetId: Long = 0,
    var levelSetName: String,
    val edition: Set<Edition> = HashSet(),
    var levels: Set<Levels> = HashSet()
)
