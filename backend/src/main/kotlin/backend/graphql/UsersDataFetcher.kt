package backend.graphql

import backend.award.AwardType
import backend.bonuses.BonusesRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.files.FileRetrievalService
import backend.graphql.permissions.UsersPermissions
import backend.graphql.utils.*
import backend.groups.Groups
import backend.groups.GroupsRepository
import backend.levelSet.LevelSet
import backend.levels.Levels
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.userGroups.UserGroupsRepository
import backend.userLevel.UserLevelRepository
import backend.users.FirebaseUserService
import backend.users.UsersRepository
import backend.users.Users
import backend.users.UsersRoles
import backend.utils.CsvReader
import backend.utils.UserMapper
import com.google.common.primitives.Floats.max
import com.google.firebase.ErrorCode
import com.google.firebase.auth.FirebaseAuthException
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDateTime
import kotlin.jvm.optionals.getOrNull
import kotlin.math.min

@DgsComponent
class UsersDataFetcher (private val fileRetrievalService: FileRetrievalService){

    @Autowired
    private lateinit var usersPermissions: UsersPermissions

    @Autowired
    private lateinit var permissionService: PermissionService

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

    @DgsQuery
    @Transactional
    fun listSetupUsers(@InputArgument editionId: Long): List<UserWithPermissions> {
        val action = "listSetupUsers"
        val arguments = mapOf(
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val users = usersRepository.findAll().map {
            UserWithPermissions(
                user = it,
                permissions = ListPermissionsOutput(
                    canAdd = Permission(
                        "addUser",
                        objectMapper.createObjectNode(),
                        false,
                        "Not applicable"),
                    canEdit = permissionService.checkPartialPermission(PermissionInput("editUser", objectMapper.writeValueAsString(mapOf("userId" to it.userId)))),
                    canCopy = Permission(
                        "copyUser",
                        objectMapper.createObjectNode(),
                        false,
                        "Not applicable"),
                    canRemove = permissionService.checkPartialPermission(PermissionInput("removeUser", objectMapper.writeValueAsString(mapOf("userId" to it.userId)))),
                    canSelect =
                    Permission(
                        "selectUser",
                        objectMapper.createObjectNode(),
                        false,
                        "Not applicable"),
                    canUnselect =
                    Permission(
                        "unselectUser",
                        objectMapper.createObjectNode(),
                        false,
                        "Not applicable"),
                    additional = listOf(
                        permissionService.checkPartialPermission(PermissionInput("markStudentAsInactive", objectMapper.writeValueAsString(mapOf("userId" to it.userId)))),
                        permissionService.checkPartialPermission(PermissionInput("markStudentAsActive", objectMapper.writeValueAsString(mapOf("userId" to it.userId)))),
                        )
                )
            )
        }.sortedBy { "${it.user.firstName} ${it.user.secondName}" }
        return users
    }


    @DgsMutation
    @Transactional
    fun assignPhotoToUser(@InputArgument userId: Long, @InputArgument fileId: Long?): Boolean {
        val action = "assignPhotoToUser"
        val arguments = mapOf(
            "userId" to userId,
            "fileId" to fileId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val user = usersRepository.findById(userId).orElseThrow { IllegalArgumentException("Invalid user ID") }

        val result = photoAssigner.assignPhotoToAssignee(usersRepository, "image/user", userId, fileId)

        if (result){
            if (userMapper.getCurrentUser().userId == userId){
                user.avatarSetByUser = true
                usersRepository.save(user)
            }
        }

        return result
    }

    @DgsMutation
    @Transactional
    fun addUser(@InputArgument indexNumber: Int, @InputArgument nick: String,
                @InputArgument firstName: String, @InputArgument secondName: String,
                @InputArgument role: String, @InputArgument email: String = "",
                @InputArgument label: String = "", @InputArgument createFirebaseUser: Boolean = false,
                @InputArgument sendEmail: Boolean = false): Users {
        val action = "addUser"
        val arguments = mapOf(
            "indexNumber" to indexNumber,
            "nick" to nick,
            "firstName" to firstName,
            "secondName" to secondName,
            "role" to role,
            "email" to email,
            "label" to label,
            "createFirebaseUser" to createFirebaseUser,
            "sendEmail" to sendEmail
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        return addUserHelper(indexNumber, nick, firstName, secondName, role, email, label, createFirebaseUser, sendEmail)
    }

    @DgsMutation
    @Transactional
    fun addTeacher(@InputArgument firstName: String, @InputArgument secondName: String,
                @InputArgument email: String = "",
                @InputArgument label: String = "", @InputArgument createFirebaseUser: Boolean = false,
                @InputArgument sendEmail: Boolean = false): Users {
        val action = "addTeacher"
        val arguments = mapOf(
            "firstName" to firstName,
            "secondName" to secondName,
            "email" to email,
            "label" to label,
            "createFirebaseUser" to createFirebaseUser,
            "sendEmail" to sendEmail
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        return addUserHelper(-1, "", firstName, secondName, "teacher", email, label, createFirebaseUser, sendEmail)
    }

    @DgsMutation
    @Transactional
    fun setStudentNick(@InputArgument userId: Long, @InputArgument nick: String): Users {
        val action = "setStudentNick"
        val arguments = mapOf(
            "userId" to userId,
            "nick" to nick
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val user = usersRepository.findById(userId).orElseThrow { IllegalArgumentException("Invalid user ID") }

        user.nick = nick
        if (userMapper.getCurrentUser().userId == userId){
            user.nickSetByUser = true
        }

        return usersRepository.save(user)
    }

    @DgsMutation
    @Transactional
    fun parseUsersFromCsv(@InputArgument fileId: Long, @InputArgument editionId: Long): ParsedUsersType {
        val action = "parseUsersFromCsv"
        val arguments = mapOf(
            "fileId" to fileId,
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }


        val file = fileEntityRepository.findById(fileId).orElseThrow { IllegalArgumentException("File not found") }
        val usosId = csvReader.extractGroupNumber(file.fileName).toLong()
        val users = csvReader.getUsersFromCsv(file)
        val parsedUsers = ParsedUsersType(users, usosId)

        fileRetrievalService.deleteFile(file.fileId)
        return parsedUsers
    }

    @DgsQuery
    @Transactional
    fun validateUsersToBeAdded(@InputArgument userIndexes: List<Int>, @InputArgument editionId: Long): List<NotValidUser> {
        val action = "validateUsersToBeAdded"
        val arguments = mapOf(
            "userIndexes" to userIndexes,
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
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
        val action = "editUser"
        val arguments = mapOf(
            "userId" to userId,
            "indexNumber" to indexNumber,
            "nick" to nick,
            "firstName" to firstName,
            "secondName" to secondName,
            "role" to role,
            "label" to label
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val user = usersRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }


        indexNumber?.let {
            if (user.role == UsersRoles.STUDENT) {
                user.email = "$it@$emailDomain"
            }
            user.indexNumber = it
        }

        nick?.let {
            user.nick = it
        }

        firstName?.let {
            user.firstName = it
        }

        secondName?.let {
            user.secondName = it
        }

        role?.let {
            user.role = UsersRoles.valueOf(it.uppercase())
        }

        label?.let {
            user.label = it
        }

        return usersRepository.save(user)
    }

    @DgsMutation
    @Transactional
    fun removeUser(@InputArgument userId: Long): Boolean {
        val action = "removeUser"
        val arguments = mapOf(
            "userId" to userId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }



        val user = usersRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("User not found") }

        userLevelRepository.deleteAllByUser_UserId(userId)
        try {
            if (user.firebaseUid != null && user.firebaseUid != "") {
                firebaseUserService.deleteFirebaseUser(user.firebaseUid!!)
            }
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
        val action = "resetPassword"
        val arguments = mapOf(
            "userId" to userId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val user = usersRepository.findByUserId(userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        return firebaseUserService.resetPassword(user.email)
    }

    @DgsMutation
    @Transactional
    fun resetPasswordByEmail(@InputArgument email: String): Boolean {
        val action = "resetPasswordByEmail"
        val arguments = mapOf(
            "email" to email
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        if (usersRepository.existsByEmail(email)) {
            return firebaseUserService.resetPassword(email)
        }
        return true
    }

    @DgsMutation
    @Transactional
    fun markPassingStudentsFromEditionAsInactive(@InputArgument editionId: Long): Boolean{
        val action = "markPassingStudentsFromEditionAsInactive"
        val arguments = mapOf(
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val passingStudents = usersRepository.findByUserGroups_Group_Edition(edition).filter { it.role == UsersRoles.STUDENT }
            .filter { user -> user.userLevels.any { it.computedGrade >= 3.0 }}
        passingStudents.forEach { it.active = false }
        usersRepository.saveAll(passingStudents)
        return true
    }

    @DgsMutation
    @Transactional
    fun markStudentAsInactive(@InputArgument userId: Long): Boolean{
        val action = "markStudentAsInactive"
        val arguments = mapOf(
            "userId" to userId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val user = usersRepository.findByUserId(userId).orElseThrow { IllegalArgumentException("Invalid user ID") }
        user.active = false
        usersRepository.save(user)
        return true
    }

    @DgsMutation
    @Transactional
    fun markStudentAsActive(@InputArgument userId: Long): Boolean{
        val action = "markStudentAsActive"
        val arguments = mapOf(
            "userId" to userId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val user = usersRepository.findByUserId(userId).orElseThrow { IllegalArgumentException("Invalid user ID") }
        user.active = true
        usersRepository.save(user)
        return true
    }


    @DgsQuery
    @Transactional
    fun getStudentPoints(@InputArgument studentId: Long, @InputArgument editionId: Long): StudentPointsType {
        val action = "getStudentPoints"
        val arguments = mapOf(
            "studentId" to studentId,
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }


        val user = usersRepository.findById(studentId).orElseThrow { IllegalArgumentException("Invalid student ID") }



        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val teacher = user.userGroups.firstOrNull { it.group.edition == edition }?.group?.teacher
            ?: throw IllegalArgumentException("Student is not in any group")
        val points = pointsRepository.findAllByStudentAndSubcategory_Edition(user, edition)
        val bonuses = bonusesRepository.findByChestHistory_User_UserId(studentId)

        val additivePrevBonuses = bonuses.filter { it.award.awardType == AwardType.ADDITIVE_PREV }.sortedBy { it.points.createdAt }

        val subcategoryPoints = points.sortedByDescending { it.subcategory.ordinalNumber }.groupBy { it.subcategory }
            .map { (subcategory, points) ->
                val purePoints = points.firstOrNull { bonusesRepository.findByPoints(it).isEmpty() }
                val allBonuses = bonuses.filter { (it.award.awardType != AwardType.MULTIPLICATIVE && it.points.subcategory == subcategory)  ||
                        ((it.award.awardType == AwardType.MULTIPLICATIVE) && it.points.subcategory.category == subcategory.category) }
                    .filter { it.award.awardType != AwardType.ADDITIVE_PREV }
                val partialBonusType = allBonuses.map { bonus ->
                    PartialBonusType(
                        bonuses = bonus,
                        partialValue = if (bonus.award.awardType == AwardType.MULTIPLICATIVE) {
                            purePoints?.value?.times(bonus.award.awardValue)?.toFloat() ?: 0f
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
            }.toMutableList()


        val uniqueCategories = categoriesRepository.findByCategoryEdition_Edition(edition).filter { it.canAddPoints }
        uniqueCategories.forEach { category ->
            val categoryPoints = subcategoryPoints.filter { it.subcategory.category == category }.sortedByDescending { it.subcategory.ordinalNumber }.toMutableList()
            val additivePrevBonusesInCategory = additivePrevBonuses.filter { it.points.subcategory.category == category }.associateWith { it.points.value.toFloat() }
            for (bonus in additivePrevBonusesInCategory){
                categoryPoints.sortByDescending { it.subcategory.ordinalNumber }
                var valueToSpread = bonus.value
                var i = 0
                while (valueToSpread > 0){
                    if (i >= categoryPoints.size){
                        break
                    }
                    val subcategoryPoint = categoryPoints[i].points
                    val purePoints = subcategoryPoint.purePoints?.value?.toFloat() ?: 0f
                    val pointsFromAddPrev = subcategoryPoint.partialBonusType.filter { it.bonuses.award.awardType == AwardType.ADDITIVE_PREV }
                        .sumOf { it.partialValue.toDouble() }.toFloat()
                    val maxPoints = categoryPoints[i].subcategory.maxPoints.toFloat()
                    val freeSpace = maxPoints - purePoints - pointsFromAddPrev
                    val pointsToAdd = max(min(valueToSpread, freeSpace), 0f)
                    valueToSpread -= pointsToAdd
                    if (pointsToAdd != 0f){
                        categoryPoints[i].points.partialBonusType = categoryPoints[i].points.partialBonusType.toMutableList().apply {
                            add(PartialBonusType(
                                bonuses = bonus.key,
                                partialValue = pointsToAdd
                            ))
                        }
                    }
                    i++
                }

                if (valueToSpread > 0){
                    val nextSubcategoriesWithoutPurePoints = subcategoriesRepository.findAllByCategoryAndEdition(category, edition)
                        .filter { subcategory -> subcategory.points.none { it.bonuses == null } }
                        .sortedBy { it.ordinalNumber }
                    var j = 0
                    while (valueToSpread > 0){
                        if (j >= nextSubcategoriesWithoutPurePoints.size){
                            break
                        }
                        val subcategory = nextSubcategoriesWithoutPurePoints[j]
                        val maxPoints = subcategory.maxPoints.toFloat()
                        val index = categoryPoints.find {it.subcategory == subcategory}?.let { categoryPoints.indexOf(it) }
                        val pointsFromAddPrev = if (index != null){
                            categoryPoints[index].points.partialBonusType.filter { it.bonuses.award.awardType == AwardType.ADDITIVE_PREV }
                                .sumOf { it.partialValue.toDouble() }.toFloat()
                        } else {
                            0f
                        }
                        val freeSpace = maxPoints - pointsFromAddPrev
                        val pointsToAdd = max(min(valueToSpread, freeSpace), 0f)
                        valueToSpread -= pointsToAdd
                        if (pointsToAdd != 0f){
                            if (index != null){
                                categoryPoints[index].points.partialBonusType = categoryPoints[index].points.partialBonusType.toMutableList().apply {
                                    add(PartialBonusType(
                                        bonuses = bonus.key,
                                        partialValue = pointsToAdd
                                    ))
                                }
                            } else {
                                categoryPoints.add(SubcategoryPointsType(
                                    subcategory = subcategory,
                                    points = PurePointsType(
                                        purePoints = null,
                                        partialBonusType = listOf(PartialBonusType(
                                            bonuses = bonus.key,
                                            partialValue = pointsToAdd
                                        ))
                                    ),
                                    teacher = bonus.key.points.teacher,
                                    createdAt = bonus.key.points.createdAt,
                                    updatedAt = bonus.key.points.updatedAt
                                ))
                            }
                        }
                        j++
                    }
                }
            }
            subcategoryPoints.removeAll { it.subcategory.category == category }
            subcategoryPoints.addAll(categoryPoints)
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
        val action = "getSumOfPointsForStudentByCategory"
        val arguments = mapOf(
            "studentId" to studentId,
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val user = usersRepository.findById(studentId).orElseThrow { IllegalArgumentException("Invalid student ID") }

        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
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
    fun getCurrentUser(): UserWithEditions {
        val action = "getCurrentUser"
        val arguments = mapOf<String, Any>()
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }
        val user = userMapper.getCurrentUser()
        val editions = if (user.role == UsersRoles.COORDINATOR){
            editionRepository.findAll()
        } else {
            editionRepository.findAllByGroups_UserGroups_User(user)
        }
        return UserWithEditions(user, editions)
    }

    fun isValidEmail(email: String): Boolean {
        val emailPattern = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$"
        return email.matches(Regex(emailPattern))
    }

    @Transactional
    fun addUserHelper(indexNumber: Int,  nick: String,
                               firstName: String,  secondName: String,
                               role: String,  email: String,
                               label: String = "",  createFirebaseUser: Boolean = false,
                               sendEmail: Boolean = false,
                               imageFileId: Long? = null): Users {
        val permission = usersPermissions.checkAddUserHelperPermission(indexNumber, nick, firstName, secondName, role, email, label, createFirebaseUser, sendEmail, imageFileId)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }


        val indexNumberToSet = if (indexNumber == -1) {
            getNegativeUniqueIndexNumber()
        } else {
            indexNumber
        }

        val nickToBeSet = if (indexNumber == -1) {
            "$firstName.$secondName.$indexNumberToSet"
        } else {
            nick
        }

        val userRole1 = UsersRoles.valueOf(role.uppercase())

        var userEmail = email
        if (email.isEmpty()) {
            userEmail = "$indexNumberToSet@$emailDomain"
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
        user.nickSetByUser = false
        user.avatarSetByUser = false
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
        photoAssigner.assignPhotoToAssignee(usersRepository, "image/user", user.userId, imageFileId)

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

data class UserWithPermissions(
    val user: Users,
    val permissions: ListPermissionsOutput
)

data class UserWithEditions(
    val user: Users,
    val editions: List<Edition>
)

