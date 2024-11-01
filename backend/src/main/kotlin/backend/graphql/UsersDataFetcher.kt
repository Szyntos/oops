package backend.graphql

import backend.award.AwardType
import backend.bonuses.BonusesRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.files.FileRetrievalService
import backend.files.FileUploadService
import backend.groups.Groups
import backend.groups.GroupsRepository
import backend.levels.Levels
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.userGroups.UserGroups
import backend.userGroups.UserGroupsRepository
import backend.userLevel.UserLevelRepository
import backend.users.FirebaseUserService
import backend.users.UsersRepository
import backend.users.Users
import backend.users.UsersRoles
import backend.utils.CsvReader
import backend.utils.UserMapper
import com.google.firebase.ErrorCode
import com.google.firebase.auth.FirebaseAuthException
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import org.apache.catalina.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDateTime
import kotlin.math.exp
import kotlin.math.min

@DgsComponent
class UsersDataFetcher (private val fileRetrievalService: FileRetrievalService){

    @Autowired
    private lateinit var userLevelRepository: UserLevelRepository

    @Autowired
    private lateinit var groupsRepository: GroupsRepository

    @Autowired
    private lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    private lateinit var editionRepository: EditionRepository

    @Autowired
    private lateinit var bonusesRepository: BonusesRepository

    @Autowired
    lateinit var usersRepository: UsersRepository

    @Autowired
    lateinit var pointsRepository: PointsRepository

    @Autowired
    lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    lateinit var photoAssigner: PhotoAssigner

    @Autowired
    lateinit var firebaseUserService: FirebaseUserService

    @Autowired
    lateinit var fileEntityRepository: FileEntityRepository

    @Autowired
    lateinit var userGroupsRepository: UserGroupsRepository

    @Autowired
    lateinit var userMapper: UserMapper

    @Autowired
    lateinit var csvReader: CsvReader

    @Value("\${constants.emailDomain}")
    lateinit var emailDomain: String

    @DgsMutation
    @Transactional
    fun assignPhotoToUser(@InputArgument userId: Long, @InputArgument fileId: Long?): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != userId) {
            throw IllegalArgumentException("Student can only assign a photo to themselves")
        }

        val user = usersRepository.findById(userId).orElseThrow { IllegalArgumentException("Invalid user ID") }

        if (currentUser.role == UsersRoles.TEACHER && user.role == UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Teacher cannot assign a photo to a coordinator")
        }

        return photoAssigner.assignPhotoToAssignee(usersRepository, "image/user", userId, fileId)
    }

    @DgsMutation
    @Transactional
    fun addUser(@InputArgument indexNumber: Int, @InputArgument nick: String,
                @InputArgument firstName: String, @InputArgument secondName: String,
                @InputArgument role: String, @InputArgument email: String = "",
                @InputArgument label: String = "", @InputArgument createFirebaseUser: Boolean = false,
                @InputArgument sendEmail: Boolean = false): Users {
        return addUserHelper(indexNumber, nick, firstName, secondName, role, email, label, createFirebaseUser, sendEmail)
    }

    @DgsMutation
    @Transactional
    fun addTeacher(@InputArgument firstName: String, @InputArgument secondName: String,
                @InputArgument email: String = "",
                @InputArgument label: String = "", @InputArgument createFirebaseUser: Boolean = false,
                @InputArgument sendEmail: Boolean = false): Users {
        return addUserHelper(-1, "", firstName, secondName, "teacher", email, label, createFirebaseUser, sendEmail)
    }

    @DgsMutation
    @Transactional
    fun parseUsersFromCsv(@InputArgument fileId: Long, @InputArgument editionId: Long): ParsedUsersType {
        val currentUser = userMapper.getCurrentUser()

        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only a coordinator can parse users from a CSV file")
        }

        val file = fileEntityRepository.findById(fileId).orElseThrow { IllegalArgumentException("File not found") }
        if (file.fileType != "text/csv") {
            throw IllegalArgumentException("Invalid file type")
        }
        val usosId = csvReader.extractGroupNumber(file.fileName).toLong()
        val users = csvReader.getUsersFromCsv(file)
        val parsedUsers = ParsedUsersType(users, usosId)

        fileRetrievalService.deleteFile(file.fileId)
        return parsedUsers
    }

    @DgsQuery
    @Transactional
    fun validateUsersToBeAdded(@InputArgument userIndexes: List<Int>, @InputArgument editionId: Long): List<NotValidUser> {
        val currentUser = userMapper.getCurrentUser()

        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only a coordinator can validate users to be added")
        }

        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val notValidUsers = userIndexes.mapNotNull { index -> usersRepository.findByIndexNumber(index) }
            .filter { user -> user.userGroups.any { it.group.edition == edition } }
            .map { user ->
                NotValidUser(user, user.userGroups.first { it.group.edition == edition }.group) }
        return notValidUsers
    }


    @DgsMutation
    @Transactional
    fun editUser(
        @InputArgument userId: Long,
        @InputArgument indexNumber: Int?,
        @InputArgument nick: String?,
        @InputArgument firstName: String?,
        @InputArgument secondName: String?,
        @InputArgument role: String?,
        @InputArgument label: String?
    ): Users {
        val currentUser = userMapper.getCurrentUser()

        val user = usersRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            if (currentUser.userId != userId){
                throw IllegalArgumentException("Student can only edit themselves")
            }
            if (indexNumber != null || firstName != null || secondName != null || role != null || label != null){
                throw IllegalArgumentException("Student can only edit their own nick")
            }
        }
        if (currentUser.role == UsersRoles.TEACHER){
            if (currentUser.userId != userId && user.role != UsersRoles.STUDENT){
                throw IllegalArgumentException("Teacher can only edit students or themselves")
            }
            if (currentUser.userId == userId){
                if (role != null){
                    throw IllegalArgumentException("Teacher cannot change their own role")
                }
            }

            val activeUserEditions = user.userGroups.map { it.group.edition }.filter { it.endDate.isAfter(java.time.LocalDate.now()) }
            if (activeUserEditions.isEmpty()){
                throw IllegalArgumentException("Teacher can only edit students that are in an active edition")
            }

            val userGroups = groupsRepository.findByUserGroups_User_UserId(userId)
            if (userGroups.none { it.teacher == currentUser }){
                throw IllegalArgumentException("Teacher can only edit students that are in their groups")
            }
            if (role != null){
                throw IllegalArgumentException("Teacher cannot edit role of a student")
            }
        }


        indexNumber?.let {
            if (usersRepository.existsByIndexNumber(it) && it != user.indexNumber) {
                throw IllegalArgumentException("User with index number $it already exists")
            }
            user.indexNumber = it
        }

        nick?.let {
            if (usersRepository.findByNick(it) != null && it != user.nick) {
                throw IllegalArgumentException("User with nick $it already exists")
            }
            user.nick = it
        }

        firstName?.let {
            user.firstName = it
        }

        secondName?.let {
            user.secondName = it
        }

        role?.let {
            val userRole = try {
                UsersRoles.valueOf(it.uppercase())
            } catch (e: IllegalArgumentException) {
                throw IllegalArgumentException("Invalid role")
            }
            user.role = userRole
        }

        label?.let {
            user.label = it
        }

        return usersRepository.save(user)
    }

    @DgsMutation
    @Transactional
    fun removeUser(@InputArgument userId: Long): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only a coordinator can remove a user")
        }
        if (currentUser.userId == userId){
            throw IllegalArgumentException("Cannot remove yourself")
        }

        val user = usersRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        if (user.role == UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Cannot remove coordinator")
        }

        if (user.userGroups.isNotEmpty()){
            throw IllegalArgumentException("Cannot remove user that is in a group")
        }

        userLevelRepository.deleteAllByUser_UserId(userId)
        try {
            user.firebaseUid?.let { firebaseUserService.deleteFirebaseUser(it) }
            } catch (e: FirebaseAuthException) {
                if (e.errorCode != ErrorCode.NOT_FOUND) {
                    throw e
                }
            }
        usersRepository.delete(user)
        return true
    }

    @DgsMutation
    @Transactional
    fun resetPassword(@InputArgument userId: Long): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != userId) {
            throw IllegalArgumentException("Student can only reset their own password")
        }

        val user = usersRepository.findByUserId(userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        return firebaseUserService.resetPassword(user.email)
    }


    @DgsQuery
    @Transactional
    fun getStudentPoints(@InputArgument studentId: Long, @InputArgument editionId: Long): StudentPointsType {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != studentId) {
            throw IllegalArgumentException("Student can only view their own points")
        }

        val user = usersRepository.findById(studentId).orElseThrow { IllegalArgumentException("Invalid student ID") }
        if (user.role != UsersRoles.STUDENT) {
            throw IllegalArgumentException("User is not a student")
        }

        if (currentUser.role == UsersRoles.TEACHER){
            val userGroupsEditions = groupsRepository.findByUserGroups_User_UserId(studentId).map { it.edition }
            val teacherGroupsEditions = groupsRepository.findByTeacher_UserId(currentUser.userId).map { it.edition }
            if (userGroupsEditions.intersect(teacherGroupsEditions).isEmpty()){
                throw IllegalArgumentException("Teacher can only view points of students that are in their editions")
            }
        }

        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
        if (user.userGroups.none { it.group.edition == edition }) {
            throw IllegalArgumentException("Student is not participating in this edition")
        }
        val teacher = user.userGroups.filter { it.group.edition == edition }.firstOrNull()?.group?.teacher
            ?: throw IllegalArgumentException("Student is not in any group")
        val points = pointsRepository.findAllByStudentAndSubcategory_Edition(user, edition)
        val bonuses = bonusesRepository.findByChestHistory_User_UserId(studentId)

        val additivePrevBonuses = bonuses.filter { it.award.awardType == AwardType.ADDITIVE_PREV }

        val additivePrevBonusesMap = additivePrevBonuses.associateWith { it.points.value }.toMutableMap()

        val subcategoryPoints = points.sortedByDescending { it.subcategory.ordinalNumber }.groupBy { it.subcategory }
            .map { (subcategory, points) ->
                val purePoints = points.filter { bonusesRepository.findByPoints(it).isEmpty() }.firstOrNull()
                val allBonuses = bonuses.filter { (it.award.awardType != AwardType.MULTIPLICATIVE && it.award.awardType != AwardType.ADDITIVE_PREV && it.points.subcategory == subcategory)  ||
                        ((it.award.awardType == AwardType.MULTIPLICATIVE || it.award.awardType == AwardType.ADDITIVE_PREV) && it.points.subcategory.category == subcategory.category) }
                val partialBonusType = allBonuses.map { bonus ->
                    PartialBonusType(
                        bonuses = bonus,
                        partialValue = if (bonus.award.awardType == AwardType.MULTIPLICATIVE) {
                            purePoints?.value?.times(bonus.award.awardValue)?.toFloat() ?: 0f
                        } else if (bonus.award.awardType == AwardType.ADDITIVE_PREV) {
                            val contribution = min(
                                additivePrevBonusesMap[bonus]?.toFloat() ?: 0f,
                                purePoints?.value?.let { (purePoints.subcategory.maxPoints.toFloat()).minus(it.toFloat()) } ?: 0f
                            )
                            additivePrevBonusesMap[bonus] = BigDecimal(((additivePrevBonusesMap[bonus]?.toFloat() ?: 0f) - contribution).toString()).setScale(2, RoundingMode.HALF_UP)
                            contribution
                        } else {
                            bonus.points.value.toFloat()
                        }
                    )
                }
                val teacherToPoints = purePoints?.teacher ?: allBonuses.maxByOrNull { it.updatedAt }?.points?.teacher ?: Users()
                val createdAt = purePoints?.createdAt ?: allBonuses.minOfOrNull { it.points.createdAt } ?: LocalDateTime.now()
                val updatedAt = purePoints?.updatedAt ?: allBonuses.maxOfOrNull { it.points.updatedAt } ?: LocalDateTime.now()
                SubcategoryPointsType(
                    subcategory = subcategory,
                    points = PurePointsType(
                        purePoints = purePoints,
                        partialBonusType = partialBonusType
                    ),
                    teacher = teacherToPoints,
                    createdAt = createdAt,
                    updatedAt = updatedAt
                )
            }

        val sumOfPurePoints = BigDecimal(subcategoryPoints.sumOf { it.points.purePoints?.value?.toDouble() ?: 0.0 }.toString())
            .setScale(2, RoundingMode.HALF_UP).toFloat()
        val sumOfBonuses = BigDecimal(subcategoryPoints.sumOf { it.points.partialBonusType.sumOf { it.partialValue.toDouble() } })
            .setScale(2, RoundingMode.HALF_UP).toFloat()
        val sumOfAll = BigDecimal((sumOfPurePoints + sumOfBonuses).toString()).setScale(2, RoundingMode.HALF_UP).toFloat()

        return StudentPointsType(
            user = user,
            teacher = teacher,
            level = user.getLevelByEdition(edition)?.level,
            subcategoryPoints = subcategoryPoints.sortedByDescending { it.createdAt },
            sumOfPurePoints = sumOfPurePoints,
            sumOfBonuses = sumOfBonuses,
            sumOfAll = sumOfAll
        )
    }

    @DgsQuery
    @Transactional
    fun getSumOfPointsForStudentByCategory(@InputArgument studentId: Long, @InputArgument editionId: Long): List<CategoryPointsSumType> {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR) && currentUser.userId != studentId) {
            throw IllegalArgumentException("Student can only view their own points")
        }

        val user = usersRepository.findById(studentId).orElseThrow { IllegalArgumentException("Invalid student ID") }
        if (user.role != UsersRoles.STUDENT) {
            throw IllegalArgumentException("User is not a student")
        }

        if (currentUser.role == UsersRoles.TEACHER){
            val userGroupsEditions = groupsRepository.findByUserGroups_User_UserId(studentId).map { it.edition }
            val teacherGroupsEditions = groupsRepository.findByTeacher_UserId(currentUser.userId).map { it.edition }
            if (userGroupsEditions.intersect(teacherGroupsEditions).isEmpty()){
                throw IllegalArgumentException("Teacher can only view points of students that are in their editions")
            }
        }

        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
        if (user.userGroups.none { it.group.edition == edition }) {
            throw IllegalArgumentException("Student is not participating in this edition")
        }
        val points = pointsRepository.findAllByStudentAndSubcategory_Edition(user, edition)
        val bonuses = bonusesRepository.findByChestHistory_User_UserId(studentId).filter { it.points.subcategory.edition == edition }
        val categories = categoriesRepository.findByCategoryEdition_Edition(edition)

        return categories.filter{it.canAddPoints}
                .map { category ->
                    val categoryPoints = points.filter { it.subcategory.category == category }
                    val purePoints = categoryPoints.filter { bonusesRepository.findByPoints(it).isEmpty() }
                    val purePointsSum = purePoints.sumOf { it.value.toDouble() }.toFloat()
                    val bonusesSum = bonuses.filter { it.points.subcategory.category == category && it.points.subcategory.edition == edition }
                        .sumOf { it.points.value.toDouble() }.toFloat()
                    val totalSum = purePointsSum + bonusesSum
                    val maxPoints = subcategoriesRepository.findByCategoryAndEdition(category, edition)
                        .sumOf { it.maxPoints.toDouble() }.toFloat()

                    CategoryPointsSumType(
                        category = category,
                        sumOfPurePoints = purePointsSum,
                        sumOfBonuses = bonusesSum,
                        sumOfAll = totalSum,
                        maxPoints = maxPoints
                    )
                }
    }
    @DgsQuery
    @Transactional
    fun getCurrentUser(): Users {
        return userMapper.getCurrentUser()
    }

    fun isValidEmail(email: String): Boolean {
        val emailPattern = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
        return email.matches(Regex(emailPattern))
    }
    
    fun addUserHelper(indexNumber: Int,  nick: String,
                               firstName: String,  secondName: String,
                               role: String,  email: String,
                               label: String = "",  createFirebaseUser: Boolean = false,
                               sendEmail: Boolean = false,
                               imageFileId: Long? = null): Users {
        val currentUser = userMapper.getCurrentUser()

        if (currentUser.userId != 0L && (currentUser.role != UsersRoles.COORDINATOR && currentUser.role != UsersRoles.TEACHER)) {
            throw IllegalArgumentException("Only a coordinator or a teacher can add a user")
        }

        val indexNumberToSet = if (indexNumber == -1) {
            if (currentUser.role != UsersRoles.COORDINATOR) {
                throw IllegalArgumentException("Only a coordinator can add a teacher")
            }
            if (UsersRoles.valueOf(role.uppercase()) != UsersRoles.TEACHER) {
                throw IllegalArgumentException("Only a teacher can be added with this mutation")
            }
            if (email.isEmpty()) {
                throw IllegalArgumentException("Email is required for a teacher")
            }
            getNegativeUniqueIndexNumber()
        } else {
            indexNumber
        }

        val nickToBeSet = if (indexNumber == -1) {
            if (nick.isNotBlank()){
                throw IllegalArgumentException("Nick is not required for a teacher")
            }
            "$firstName.$secondName.$indexNumberToSet"
        } else {
            if (nick.isEmpty()) {
                throw IllegalArgumentException("Nick is required")
            }
            nick
        }

        // TODO: Find a better way to handle adding a first coordinator
        if (currentUser.userId == 0L ) {
            if (UsersRoles.valueOf(role.uppercase()) != UsersRoles.COORDINATOR) {
                throw IllegalArgumentException("Only a coordinator can be added with this bypass")
            }
        }

        if (UsersRoles.valueOf(role.uppercase()) == UsersRoles.COORDINATOR) {
            if (currentUser.role != UsersRoles.COORDINATOR || currentUser.userId != 0L) {
                throw IllegalArgumentException("Only a coordinator can add a coordinator")
            }
        }

        if (UsersRoles.valueOf(role.uppercase()) == UsersRoles.TEACHER) {
            if (currentUser.role != UsersRoles.COORDINATOR) {
                throw IllegalArgumentException("Only a coordinator can add a teacher")
            }
        }


        if (usersRepository.existsByIndexNumber(indexNumberToSet)) {
            throw IllegalArgumentException("User with index number $indexNumberToSet already exists")
        }
        if (usersRepository.findByNick(nickToBeSet) != null) {
            throw IllegalArgumentException("User with nick $nickToBeSet already exists")
        }
        val userRole1 = try {
            UsersRoles.valueOf(role.uppercase())
        } catch (e: IllegalArgumentException) {
            throw IllegalArgumentException("Invalid role")
        }
        var userEmail = email
        if (email.isEmpty()) {
            userEmail = "$indexNumberToSet@$emailDomain"
        } else if (!isValidEmail(userEmail)) {
            throw IllegalArgumentException("Invalid email")
        }

        if (usersRepository.existsByEmail(userEmail)) {
            throw IllegalArgumentException("User with email $userEmail already exists")
        }
        val user = Users(
            indexNumber = indexNumberToSet,
            nick = nickToBeSet,
            firstName = firstName,
            secondName = secondName,
            role = userRole1,
            email = userEmail,
            label = label
        )
        usersRepository.save(user)
        if (createFirebaseUser) {
            val firebaseUid = try {
                firebaseUserService.createFirebaseUser(user, sendEmail)
            } catch (e: FirebaseAuthException) {
                if (e.errorCode == ErrorCode.ALREADY_EXISTS) {
                    firebaseUserService.getUserByEmail(user.email).uid
                } else {
                    throw e
                }
            }
            user.firebaseUid = firebaseUid
        }
        if (imageFileId != null) {
            photoAssigner.assignPhotoToAssignee(usersRepository, "image/user", user.userId, imageFileId)
        }
        return user
    }

    private fun getNegativeUniqueIndexNumber(): Int {
        var indexNumber = (0..Int.MAX_VALUE).random()
        while (usersRepository.existsByIndexNumber(indexNumber)) {
            indexNumber = (0..Int.MAX_VALUE).random()
        }
        return indexNumber
    }
}

data class StudentPointsType(
    val user: Users,
    val teacher: Users,
    val level: Levels?,
    val subcategoryPoints: List<SubcategoryPointsType>,
    val sumOfPurePoints: Float,
    val sumOfBonuses: Float,
    val sumOfAll: Float
)

data class CategoryPointsSumType(
    val category: Categories,
    val sumOfPurePoints: Float,
    val sumOfBonuses: Float,
    val sumOfAll: Float,
    val maxPoints: Float
)

data class ParsedUsersType (
    val users: List<Users>,
    val usosId: Long
)

data class NotValidUser(
    val user: Users,
    val group: Groups
)
