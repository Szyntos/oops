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
import backend.userLevel.UserLevel
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
                    canEdit = permissionService.checkPartialPermission(PermissionInput("editUser", objectMapper.writeValueAsString(mapOf("userId" to it.userId, "editionId" to editionId)))),
                    canCopy = Permission(
                        "copyUser",
                        objectMapper.createObjectNode(),
                        false,
                        "Not applicable"),
                    canRemove = permissionService.checkPartialPermission(PermissionInput("removeUser", objectMapper.writeValueAsString(mapOf("userId" to it.userId, "editionId" to editionId))),),
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
                    additional = emptyList(),
                    canOverride = permissionService.checkPartialPermission(PermissionInput("overrideComputedGradeForUser", objectMapper.writeValueAsString(mapOf("userId" to it.userId, "editionId" to editionId)))),
                    canTurnOffOverride =  permissionService.checkPartialPermission(PermissionInput("turnOffOverrideComputedGradeForUser", objectMapper.writeValueAsString(mapOf("userId" to it.userId, "editionId" to editionId)))),
                    canMarkAsInactive = permissionService.checkPartialPermission(PermissionInput("markStudentAsInactive", objectMapper.writeValueAsString(mapOf("userId" to it.userId)))),
                    canMarkAsActive =  permissionService.checkPartialPermission(PermissionInput("markStudentAsActive", objectMapper.writeValueAsString(mapOf("userId" to it.userId)))),
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

    @DgsMutation
    @Transactional
    fun overrideComputedGradeForUser(@InputArgument userId: Long, @InputArgument editionId: Long,
                              @InputArgument grade: Float): UserLevel {
        val action = "overrideComputedGradeForUser"
        val arguments = mapOf(
            "userId" to userId,
            "editionId" to editionId,
            "grade" to grade
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
        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val userLevel = userLevelRepository.findByUserAndEdition(user, edition)
            ?: throw IllegalArgumentException("User has no levels for this edition")

        userLevel.coordinatorOverride = true
        userLevelRepository.save(userLevel)

        userLevel.computedGrade = grade.toDouble()
        return userLevelRepository.save(userLevel)
    }

    @DgsMutation
    @Transactional
    fun turnOffOverrideComputedGradeForUser(@InputArgument userId: Long, @InputArgument editionId: Long): UserLevel {
        val action = "turnOffOverrideComputedGradeForUser"
        val arguments = mapOf(
            "userId" to userId,
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

        val user = usersRepository.findByUserId(userId).orElseThrow { IllegalArgumentException("Invalid user ID") }
        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val userLevel = userLevelRepository.findByUserAndEdition(user, edition)
            ?: throw IllegalArgumentException("User has no levels for this edition")

        userLevel.coordinatorOverride = false
        userLevelRepository.save(userLevel)

        if (userLevel.endOfLabsLevelsReached && userLevel.projectPointsThresholdReached){
            userLevel.computedGrade = userLevel.level.grade.toDouble()
        } else {
            userLevel.computedGrade = 2.0
        }
        return userLevelRepository.save(userLevel)
    }

    @DgsQuery
    @Transactional
    fun getStudentPoints(@InputArgument studentId: Long, @InputArgument editionId: Long): StudentPointsType {
        // Check permissions
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

        // Fetch user and edition
        val user = usersRepository.findById(studentId).orElseThrow { IllegalArgumentException("Invalid student ID") }
        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val teacher = user.userGroups.firstOrNull { it.group.edition == edition }?.group?.teacher
            ?: throw IllegalArgumentException("Student is not in any group")
        val points = pointsRepository.findAllByStudentAndSubcategory_Edition(user, edition)
        val bonuses = bonusesRepository.findByChestHistory_User_UserId(studentId)

        val subcategories = subcategoriesRepository.findAllByEdition(edition)
        val subcategoriesByCategory = subcategories.groupBy { it.category }

        val categories = categoriesRepository.findByCategoryEdition_Edition(edition).filter { it.canAddPoints }

        // Prepare data structures
        val additivePrevBonuses = bonuses.filter { it.award.awardType == AwardType.ADDITIVE_PREV }
            .sortedBy { it.points.createdAt }

        // Group points by subcategory
        val pointsBySubcategory = points.groupBy { it.subcategory }

        // Build subcategoryPoints list
        val subcategoryPointsList = mutableListOf<SubcategoryPointsType>()

        for ((subcategory, subcategoryPoints) in pointsBySubcategory) {
            // Find purePoints (points without bonuses)
            val purePoint = subcategoryPoints.firstOrNull { it.bonuses == null }

            // Get all bonuses applicable to this subcategory
            val applicableBonuses = bonuses.filter { bonus ->
                val bonusType = bonus.award.awardType
                val bonusPoints = bonus.points
                val appliesToSubcategory = bonusType != AwardType.MULTIPLICATIVE && bonusPoints.subcategory == subcategory
                val appliesToCategory = bonusType == AwardType.MULTIPLICATIVE && bonusPoints.subcategory.category == subcategory.category
                (appliesToSubcategory || appliesToCategory) && bonusType != AwardType.ADDITIVE_PREV
            }

            // Calculate partial bonuses
            val partialBonusTypes = applicableBonuses.map { bonus ->
                val partialValue = if (bonus.award.awardType == AwardType.MULTIPLICATIVE) {
                    purePoint?.value?.times(bonus.award.awardValue)?.toFloat() ?: 0f
                } else {
                    bonus.points.value.toFloat()
                }
                PartialBonusType(
                    bonuses = bonus,
                    partialValue = partialValue
                )
            }

            // Determine teacher, createdAt, updatedAt
            val teacherToPoints = purePoint?.teacher
                ?: applicableBonuses.maxByOrNull { it.updatedAt }?.points?.teacher
                ?: Users()
            val createdAt = purePoint?.createdAt
                ?: applicableBonuses.minOfOrNull { it.points.createdAt }
                ?: LocalDateTime.now()
            val updatedAt = purePoint?.updatedAt
                ?: applicableBonuses.maxOfOrNull { it.points.updatedAt }
                ?: LocalDateTime.now()

            val purePointsType = PurePointsType(
                purePoints = purePoint,
                partialBonusType = partialBonusTypes
            )

            val subcategoryPointsType = SubcategoryPointsType(
                subcategory = subcategory,
                points = purePointsType,
                teacher = teacherToPoints,
                createdAt = createdAt,
                updatedAt = updatedAt
            )

            subcategoryPointsList.add(subcategoryPointsType)
        }

        // Process ADDITIVE_PREV bonuses
        for (category in categories) {
            val categorySubcategories = subcategoriesByCategory[category] ?: emptyList()
            val categoryPoints = subcategoryPointsList.filter { it.subcategory.category == category }
                .sortedByDescending { it.subcategory.ordinalNumber }
                .toMutableList()

            val additivePrevBonusesInCategory = additivePrevBonuses.filter { it.points.subcategory.category == category }
                .associateWith { it.points.value.toFloat() }

            for ((bonus, bonusValue) in additivePrevBonusesInCategory) {
                var valueToSpread = bonusValue
                var index = 0

                // Distribute bonus to subcategories with purePoints
                while (valueToSpread > 0f && index < categoryPoints.size) {
                    val subcategoryPoint = categoryPoints[index]
                    val subcategory = subcategoryPoint.subcategory
                    val points = subcategoryPoint.points
                    val purePointsValue = points.purePoints?.value?.toFloat() ?: 0f
                    val pointsFromAddPrev = points.partialBonusType
                        .filter { it.bonuses.award.awardType == AwardType.ADDITIVE_PREV }
                        .sumOf { it.partialValue.toDouble() }
                    val maxPoints = subcategory.maxPoints.toFloat()
                    val freeSpace = maxPoints - purePointsValue - pointsFromAddPrev
                    val pointsToAdd = max(min(valueToSpread, freeSpace.toFloat()), 0f)

                    if (pointsToAdd > 0f) {
                        points.partialBonusType = points.partialBonusType.toMutableList().apply {
                            add(PartialBonusType(
                                bonuses = bonus,
                                partialValue = pointsToAdd
                            ))
                        }
                        valueToSpread -= pointsToAdd
                    }
                    index++
                }

                // Distribute remaining bonus to subcategories without purePoints
                if (valueToSpread > 0f) {
                    val subcategoriesWithoutPurePoints = categorySubcategories.filterNot { subcategory ->
                        categoryPoints.any { it.subcategory == subcategory }
                    }.sortedBy { it.ordinalNumber }

                    for (subcategory in subcategoriesWithoutPurePoints) {
                        val maxPoints = subcategory.maxPoints.toFloat()
                        val pointsFromAddPrev = 0f
                        val freeSpace = maxPoints - pointsFromAddPrev
                        val pointsToAdd = max(min(valueToSpread, freeSpace), 0f)

                        if (pointsToAdd > 0f) {
                            val newSubcategoryPoints = SubcategoryPointsType(
                                subcategory = subcategory,
                                points = PurePointsType(
                                    purePoints = null,
                                    partialBonusType = listOf(PartialBonusType(
                                        bonuses = bonus,
                                        partialValue = pointsToAdd
                                    ))
                                ),
                                teacher = bonus.points.teacher,
                                createdAt = bonus.points.createdAt,
                                updatedAt = bonus.points.updatedAt
                            )
                            categoryPoints.add(newSubcategoryPoints)
                            valueToSpread -= pointsToAdd
                        }
                        if (valueToSpread <= 0f) break
                    }
                }
            }

            // Update the main list
            subcategoryPointsList.removeAll { it.subcategory.category == category }
            subcategoryPointsList.addAll(categoryPoints)
        }

        // Calculate sums
        val sumOfPurePoints = BigDecimal(subcategoryPointsList.sumOf {
            it.points.purePoints?.value?.toDouble() ?: 0.0
        }).setScale(2, RoundingMode.HALF_UP).toFloat()

        val sumOfBonuses = BigDecimal(subcategoryPointsList.sumOf {
            it.points.partialBonusType.sumOf { bonus -> bonus.partialValue.toDouble() }
        }).setScale(2, RoundingMode.HALF_UP).toFloat()

        val sumOfAll = BigDecimal((sumOfPurePoints + sumOfBonuses).toDouble())
            .setScale(2, RoundingMode.HALF_UP).toFloat()

        // Return the result
        return StudentPointsType(
            user = user,
            teacher = teacher,
            level = user.getLevelByEdition(edition)?.level,
            subcategoryPoints = subcategoryPointsList.sortedWith(
                compareByDescending<SubcategoryPointsType> { it.createdAt }
                    .thenByDescending { it.subcategory.ordinalNumber }
            ),
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

