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
class LevelSetDataFetcher {
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
    fun addLevelSet(@InputArgument levels: List<LevelInput>): LevelSet{
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can add level sets")
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can copy level sets")
        }

        val levelSet = levelSetRepository.findById(levelSetId)
            .orElseThrow { IllegalArgumentException("Invalid level set ID") }

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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can edit level sets")
        }

        val levelSet = levelSetRepository.findById(levelSetId)
            .orElseThrow { IllegalArgumentException("Invalid level set ID") }

        if (levelSet.edition.isNotEmpty()) {
            if (levelSet.edition.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
                throw IllegalArgumentException("Edition has already ended")
            }
            if (levelSet.edition.any { it.startDate.isBefore(java.time.LocalDate.now()) }) {
                throw IllegalArgumentException("Edition has already started")
            }
        }


        val levelsInSet = levelSet.levels.sortedBy { it.ordinalNumber }
        val inputLevelIds = levels.mapNotNull { it.levelId }.toSet()

        // Remove levels not in input list
        levelsInSet.filter { it.levelId !in inputLevelIds }
            .forEach { levelNotInSet ->
                val level = levelsRepository.findById(levelNotInSet.levelId)
                    .orElseThrow { IllegalArgumentException("Invalid level ID") }

                if (level.highest) {
                    val prevLevel = levelsRepository.findByLevelSet(levelSet)
                        .firstOrNull { it.ordinalNumber == level.ordinalNumber - 1 }
                    if (prevLevel != null) {
                        prevLevel.highest = true
                        levelsRepository.save(prevLevel)
                    }
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can remove level sets")
        }

        val levelSet = levelSetRepository.findById(levelSetId)
            .orElseThrow { IllegalArgumentException("Invalid level set ID") }

        val levelsInSet = levelSet.levels.sortedBy { it.ordinalNumber }

        if (levelSet.edition.isNotEmpty()) {
            if (levelSet.edition.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
                throw IllegalArgumentException("Edition has already ended")
            }
            if (levelSet.edition.any { it.startDate.isBefore(java.time.LocalDate.now()) }) {
                throw IllegalArgumentException("Edition has already started")
            }
            if (groupsRepository.findAll().any { it.edition.levelSet == levelSet }) {
                throw IllegalArgumentException("There are groups using the level set")
            }
        }
        levelsInSet.forEach { level ->
            levelsRepository.delete(level)
        }
        levelSet.edition.forEach { it.levelSet = null }
        levelSetRepository.delete(levelSet)
        return true
    }

    @DgsMutation
    @Transactional
    fun addLevelSetToEdition(@InputArgument levelSetID: Long, @InputArgument editionId: Long): LevelSet {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can add level sets to edition")
        }

        val levelSet = levelSetRepository.findById(levelSetID)
            .orElseThrow { IllegalArgumentException("Invalid level set ID") }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }

        if (edition.endDate.isBefore(java.time.LocalDate.now())) {
            throw IllegalArgumentException("Edition has already ended")
        }
        levelSet.levelSetName = edition.editionName
        levelSetRepository.save(levelSet)
        edition.levelSet = levelSet
        editionRepository.save(edition)

        return levelSet
    }

    @DgsMutation
    @Transactional
    fun removeLevelSetFromEdition(@InputArgument levelSetId: Long, @InputArgument editionId: Long): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can remove level sets from edition")
        }

        val levelSet = levelSetRepository.findById(levelSetId)
            .orElseThrow { IllegalArgumentException("Invalid level set ID") }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }

        if (edition.endDate.isBefore(java.time.LocalDate.now())) {
            throw IllegalArgumentException("Edition has already ended")
        }

        if (edition.startDate.isBefore(java.time.LocalDate.now())) {
            throw IllegalArgumentException("Edition has already started")
        }

        if (edition.levelSet?.levelSetId != levelSetId) {
            throw IllegalArgumentException("Edition does not have the level set")
        }
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can add levels")
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
            throw IllegalArgumentException("Maximum points must be higher than the highest level in the edition")
        }
        if (highestLevel.grade > grade.toBigDecimal()){
            throw IllegalArgumentException("Grade must be higher or equal to the highest level in the edition")
        }
        if (levelsInSet.any { it.levelName == name }){
            throw IllegalArgumentException("Level with the same name already exists in the edition")
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can edit levels")
        }

        val level = levelsRepository.findById(levelId)
            .orElseThrow { IllegalArgumentException("Invalid level ID") }

        if (level.levelSet.edition.isNotEmpty()) {
            if (level.levelSet.edition.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
                throw IllegalArgumentException("Edition has already ended")
            }
            if (level.levelSet.edition.any { it.startDate.isBefore(java.time.LocalDate.now()) }) {
                throw IllegalArgumentException("Edition has already started")
            }
        }

        name?.let { newName ->
            if (levelsRepository.findByLevelSet(level.levelSet).any { level -> level.levelName == newName && level.levelId != levelId }) {
                throw IllegalArgumentException("Level with the same name already exists in the edition")
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
                throw IllegalArgumentException("Maximum points must be a positive value")
            }
            if (previousLevel != null && previousLevel.maximumPoints >= it.toBigDecimal()){
                throw IllegalArgumentException("Maximum points must be higher than the previous level")
            }
            if (nextLevel != null && nextLevel.maximumPoints <= it.toBigDecimal()){
                throw IllegalArgumentException("Maximum points must be lower than the next level")
            }
            level.maximumPoints = it.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        grade?.let {
            if (it < 0) {
                throw IllegalArgumentException("Grade must be a non-negative value")
            }
            if (previousLevel != null && previousLevel.grade > it.toBigDecimal()){
                throw IllegalArgumentException("Grade must be higher or equal to the previous level")
            }
            if (nextLevel != null && nextLevel.grade < it.toBigDecimal()){
                throw IllegalArgumentException("Grade must be lower or equal to the next level")
            }
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
                throw IllegalArgumentException("Ordinal number must be a non-negative value")
            }
            val levelsInSet = levelsRepository.findByLevelSet(level.levelSet)
            if (ordinalNumber >= levelsInSet.size){
                throw IllegalArgumentException("Ordinal number must be lower than the number of levels in the set")
            }
            val newOrdinalNumber = ordinalNumber.coerceAtMost(levelsInSet.size - 1)
            val levelsToShift = levelsInSet.filter { it.ordinalNumber in newOrdinalNumber..level.ordinalNumber }
            levelsToShift.forEach { it.ordinalNumber += 1 }
            level.ordinalNumber = newOrdinalNumber
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
