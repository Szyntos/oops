package backend.graphql

import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.groups.GroupsRepository
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
class LevelsDataFetcher {
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
    fun addLevelSet(@InputArgument levels: List<LevelInput>): List<Levels> {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can add level sets")
        }

        val levelSetId = levelsRepository.findAll().maxOfOrNull { it.levelSet }?.plus(1) ?: 1

        val levelSet = mutableListOf<Levels>()
        levels.sortedBy { it.maximumPoints }.forEachIndexed { index, levelInput ->
            levelSet +=
            addLevelHelper(
                name = levelInput.name,
                levelSet = levelSetId,
                maximumPoints = levelInput.maximumPoints,
                grade = levelInput.grade,
                imageFileId = levelInput.imageFileId
            )
        }

        return levelSet
    }

    @DgsMutation
    @Transactional
    fun editLevelSet(@InputArgument levelSet: Int, @InputArgument levels: List<LevelInput>): List<Levels> {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can edit level sets")
        }

        val levelsInSet = levelsRepository.findByLevelSet(levelSet).sortedBy { it.ordinalNumber }
        val inputLevelIds = levels.mapNotNull { it.levelId }.toSet()

        // Remove levels not in input list
        levelsInSet.filter { it.levelId !in inputLevelIds }
            .forEach { levelNotInSet ->
                val level = levelsRepository.findById(levelNotInSet.levelId)
                    .orElseThrow { IllegalArgumentException("Invalid level ID") }
                if (level.edition != null) {
                    if (level.edition!!.endDate.isBefore(java.time.LocalDate.now())) {
                        throw IllegalArgumentException("Edition has already ended")
                    }
                    if (level.edition!!.startDate.isBefore(java.time.LocalDate.now())) {
                        throw IllegalArgumentException("Edition has already started")
                    }
                }

                if (level.highest) {
                    val prevLevel = levelsRepository.findByLevelSet(levelSet)
                        .firstOrNull { it.ordinalNumber == level.ordinalNumber - 1 }

                    prevLevel?.highest = true
                    levelsRepository.save(prevLevel!!)
                }

                levelsRepository.delete(level)
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
                    imageFileId = levelInput.imageFileId
                )
            }
        }
        return levelsRepository.findByLevelSet(levelSet).sortedBy { it.ordinalNumber }
    }

    @DgsMutation
    @Transactional
    fun removeLevelSet(@InputArgument levelSet: Int): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can remove level sets")
        }



        val levelsInSet = levelsRepository.findByLevelSet(levelSet)

        val edition = levelsInSet.first().edition

        if (edition != null) {
            if (edition.endDate.isBefore(java.time.LocalDate.now())) {
                throw IllegalArgumentException("Edition has already ended")
            }
            if (edition.startDate.isBefore(java.time.LocalDate.now())) {
                throw IllegalArgumentException("Edition has already started")
            }
            if (groupsRepository.existsByEdition(edition)) {
                throw IllegalArgumentException("A group exists with the edition with the level set")
            }
        }

        levelsInSet.forEach { level ->
            levelsRepository.delete(level)
        }
        return true
    }

    @DgsMutation
    @Transactional
    fun addLevelSetToEdition(@InputArgument levelSet: Int, @InputArgument editionId: Long): List<Levels> {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can add level sets to editions")
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }

        if (edition.endDate.isBefore(java.time.LocalDate.now())) {
            throw IllegalArgumentException("Edition has already ended")
        }

        val levelsInSet = levelsRepository.findByLevelSet(levelSet)

        levelsInSet.forEach { level ->
            level.edition = edition
        }

        return levelsRepository.saveAll(levelsInSet)
    }

    @DgsMutation
    @Transactional
    fun removeLevelSetFromEdition(@InputArgument levelSet: Int, @InputArgument editionId: Long): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can remove level sets from editions")
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }

        if (edition.endDate.isBefore(java.time.LocalDate.now())) {
            throw IllegalArgumentException("Edition has already ended")
        }

        if (edition.startDate.isBefore(java.time.LocalDate.now())) {
            throw IllegalArgumentException("Edition has already started")
        }

        val levelsInSet = levelsRepository.findByLevelSet(levelSet)

        levelsInSet.forEach { level ->
            if (level.edition != edition) {
                throw IllegalArgumentException("Level set is not in the edition")
            }
            level.edition = null
        }

        levelsRepository.saveAll(levelsInSet)
        return true
    }

    @DgsMutation
    @Transactional
    fun assignPhotoToLevel(@InputArgument levelId: Long, @InputArgument fileId: Long?): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can assign photos to levels")
        }

        val level = levelsRepository.findById(levelId).orElseThrow { IllegalArgumentException("Invalid level ID") }
        if (level.edition != null){
            if (level.edition!!.endDate.isBefore(java.time.LocalDate.now())){
                throw IllegalArgumentException("Edition has already ended")
            }
        }
        return photoAssigner.assignPhotoToAssignee(levelsRepository, "image/level", levelId, fileId)
    }

    @DgsQuery
    @Transactional
    fun getLevelSets(): List<LevelSet>{
        return levelsRepository.findAll()
            .groupBy { it.levelSet }
            .map { (levelSet, levels) ->
                LevelSet(
                    levelSet,
                    levels.first().edition?.editionId,
                    levels.sortedBy { it.ordinalNumber })
            }
    }

    @DgsQuery
    @Transactional
    fun getNeighboringLevels(@InputArgument studentId: Long, @InputArgument editionId: Long): NeighboringLevelsType {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            if (currentUser.userId != studentId){
                throw IllegalArgumentException("Student can only get neighboring levels for themselves")
            }
        }
        if (currentUser.role == UsersRoles.TEACHER){
            val student = usersRepository.findById(studentId)
                .orElseThrow { IllegalArgumentException("Invalid student ID") }
            val teacherEditions = currentUser.userGroups.map { it.group.edition }
            val studentEditions = student.userGroups.map { it.group.edition }
            if (teacherEditions.intersect(studentEditions.toSet()).isEmpty()){
                throw IllegalArgumentException("Teacher can only get neighboring levels for students in their editions")
            }
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val student = usersRepository.findById(studentId)
            .orElseThrow { IllegalArgumentException("Invalid student ID") }
        if (student.userGroups.none { it.group.edition == edition }){
            throw IllegalArgumentException("Student is not in any group in the edition")
        }
        val userLevel = student.userLevels.find { it.edition == edition }
            ?: throw IllegalArgumentException("Student does not have a level in the edition")
        val currentLevel = userLevel.level
        val previousLevel =
            levelsRepository.findByLevelSet(currentLevel.levelSet)
                .firstOrNull { it.ordinalNumber == currentLevel.ordinalNumber - 1 }
        val nextLevel =
            levelsRepository.findByLevelSet(currentLevel.levelSet)
                .firstOrNull { it.ordinalNumber == currentLevel.ordinalNumber + 1 }
        return NeighboringLevelsType(
            prevLevel = previousLevel,
            currLevel = currentLevel,
            nextLevel = nextLevel
        )
    }

    fun addLevelHelper(name: String, levelSet: Int, maximumPoints: Double,
                       grade: Double, imageFileId: Long? = null, editionId: Long? = null): Levels {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can add levels")
        }
        val edition = if (editionId == null){
            null
        } else {
            editionRepository.findById(editionId)
                .orElseThrow { IllegalArgumentException("Invalid edition ID") }
        }

        val levelImage = if (imageFileId == null){
            fileEntityRepository.findAllByFileType("image/level/sample").firstOrNull()
        } else {
            val imageFile = fileEntityRepository.findById(imageFileId)
                .orElseThrow { IllegalArgumentException("Invalid image file ID") }
            val levelsWithSameImage = levelsRepository.findByImageFile(imageFile).filter { it.levelSet == levelSet }
            if (levelsWithSameImage.isNotEmpty()){
                throw IllegalArgumentException("Image is already used by another level")
            }
            imageFile
        }

        val levelsInSet = levelsRepository.findByLevelSet(levelSet)

        val highestLevel = levelsInSet.maxByOrNull { it.ordinalNumber }

        if (highestLevel == null){
            val level = Levels(
                levelName = name,
                minimumPoints = BigDecimal.ZERO,
                maximumPoints = maximumPoints.toBigDecimal().setScale(2, RoundingMode.HALF_UP),
                grade = grade.toBigDecimal().setScale(2, RoundingMode.HALF_UP),
                label = "",
                levelSet = levelSet,
                edition = edition
            )
            level.ordinalNumber = 0
            level.highest = true
            level.imageFile = levelImage
            levelsRepository.save(level)
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
            edition = edition
        )
        level.ordinalNumber = highestLevel.ordinalNumber + 1
        highestLevel.highest = false
        level.highest = true
        level.imageFile = levelImage
        levelsRepository.save(level)
        return level
    }

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

        if (level.edition != null){
            if (level.edition!!.endDate.isBefore(java.time.LocalDate.now())){
                throw IllegalArgumentException("Edition has already ended")
            }
            if (level.edition!!.startDate.isBefore(java.time.LocalDate.now())){
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
            val imageFile = fileEntityRepository.findById(imageFileId)
                .orElseThrow { IllegalArgumentException("Invalid image file ID") }
            require(imageFile.fileType == "image/level") {
                "Wrong fileType of file $imageFileId. Please upload a file with fileType = image/level and try again."
            }
            if (levelsRepository.findByImageFile_FileId(it).any { l -> l.edition == level.edition && l.levelId != levelId }) {
                throw IllegalArgumentException("Image is already used by another level in the edition")
            }
            level.imageFile = imageFile
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

data class NeighboringLevelsType(
    val prevLevel: Levels?,
    val currLevel: Levels,
    val nextLevel: Levels?
)

data class LevelInput(
    val levelId: Long? = null,
    val name: String,
    val maximumPoints: Double,
    val grade: Double,
    val imageFileId: Long? = null
)

data class LevelSet(
    val levelSetId: Int,
    val editionId: Long?,
    val levels: List<Levels>
)
