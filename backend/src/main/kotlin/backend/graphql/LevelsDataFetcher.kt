package backend.graphql

import backend.edition.EditionRepository
import backend.files.FileEntityRepository
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
    lateinit var userMapper: UserMapper

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
    fun addLevel(@InputArgument editionId: Long, @InputArgument name: String, @InputArgument maximumPoints: Double,
                    @InputArgument grade: Double, @InputArgument imageFileId: Long? = null): Levels {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can add levels")
        }

        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }
        val levelsInEdition = levelsRepository.findByEdition(edition)

        val levelImage = if (imageFileId == null){
            fileEntityRepository.findAllByFileType("image/level/sample").firstOrNull()
        } else {
            val imageFile = fileEntityRepository.findById(imageFileId)
                .orElseThrow { IllegalArgumentException("Invalid image file ID") }
            require(imageFile.fileType == "image/level") {
                "Wrong fileType of file $imageFileId. Please upload a file with fileType = image/level and try again."
            }
            val levelsWithSameImage = levelsRepository.findByImageFile(imageFile).filter { it.edition == edition }
            if (levelsWithSameImage.isNotEmpty()){
                throw IllegalArgumentException("Image is already used by another level")
            }
            fileEntityRepository.findByFileId(imageFileId)
        }

        if (levelsInEdition.isEmpty()){
            val level = Levels(
                levelName = name,
                minimumPoints = BigDecimal.ZERO,
                maximumPoints = maximumPoints.toBigDecimal().setScale(2, RoundingMode.HALF_UP),
                grade = grade.toBigDecimal().setScale(2, RoundingMode.HALF_UP),
                label = "",
                edition = edition
            )
            level.ordinalNumber = 0
            level.highest = true
            level.imageFile = levelImage
            levelsRepository.save(level)
            return level
        }

        val highestLevel = levelsInEdition.maxByOrNull { it.ordinalNumber }!!

        if (highestLevel.maximumPoints >= maximumPoints.toBigDecimal()){
            throw IllegalArgumentException("Maximum points must be higher than the highest level in the edition")
        }
        if (highestLevel.grade > grade.toBigDecimal()){
            throw IllegalArgumentException("Grade must be higher or equal to the highest level in the edition")
        }
        if (levelsInEdition.any { it.levelName == name }){
            throw IllegalArgumentException("Level with the same name already exists in the edition")
        }


        val level = Levels(
            levelName = name,
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

    @DgsMutation
    @Transactional
    fun editLevel(
        @InputArgument levelId: Long,
        @InputArgument name: String?,
        @InputArgument maximumPoints: Double?,
        @InputArgument grade: Double?,
        @InputArgument imageFileId: Long?,
        @InputArgument label: String?
    ): Levels {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can edit levels")
        }

        val level = levelsRepository.findById(levelId)
            .orElseThrow { IllegalArgumentException("Invalid level ID") }

        if (level.edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }
        if (level.edition.startDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already started")
        }

        name?.let { newName ->
            if (levelsRepository.findByEdition(level.edition).any { level -> level.levelName == newName && level.levelId != levelId }) {
                throw IllegalArgumentException("Level with the same name already exists in the edition")
            }
            level.levelName = newName
        }

        val previousLevel =
            levelsRepository.findByEdition(level.edition)
                .firstOrNull { it.ordinalNumber == level.ordinalNumber - 1 }
        val nextLevel =
            levelsRepository.findByEdition(level.edition)
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

        return levelsRepository.save(level)
    }

    @DgsMutation
    @Transactional
    fun removeLevel(@InputArgument levelId: Long): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can remove levels")
        }

        val level = levelsRepository.findById(levelId)
            .orElseThrow { IllegalArgumentException("Invalid level ID") }

        if (level.edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }
        if (level.edition.startDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already started")
        }

        if (level.highest) {
            val prevLevel = levelsRepository.findByEdition(level.edition)
                .firstOrNull { it.ordinalNumber == level.ordinalNumber - 1 }

            prevLevel?.highest = true
            levelsRepository.save(prevLevel!!)
        }

        levelsRepository.delete(level)
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
        if (level.edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }
        return photoAssigner.assignPhotoToAssignee(levelsRepository, "image/level", levelId, fileId)
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
            levelsRepository.findByEdition(edition)
                .firstOrNull { it.ordinalNumber == currentLevel.ordinalNumber - 1 }
        val nextLevel =
            levelsRepository.findByEdition(edition)
                .firstOrNull { it.ordinalNumber == currentLevel.ordinalNumber + 1 }
        return NeighboringLevelsType(
            prevLevel = previousLevel,
            currLevel = currentLevel,
            nextLevel = nextLevel
        )
    }
}

data class NeighboringLevelsType(
    val prevLevel: Levels?,
    val currLevel: Levels,
    val nextLevel: Levels?
)
