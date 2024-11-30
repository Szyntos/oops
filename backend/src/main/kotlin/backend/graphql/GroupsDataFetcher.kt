package backend.graphql

import backend.award.Award
import backend.award.AwardRepository
import backend.bonuses.Bonuses
import backend.bonuses.BonusesRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.files.FileEntity
import backend.files.FileEntityRepository
import backend.graphql.permissions.AwardsPermissions
import backend.graphql.permissions.GroupsPermissions
import backend.graphql.utils.*
import backend.groups.Groups
import backend.groups.GroupsRepository
import backend.levels.Levels
import backend.levels.LevelsRepository
import backend.points.Points
import backend.points.PointsRepository
import backend.subcategories.Subcategories
import backend.subcategories.SubcategoriesRepository
import backend.userGroups.UserGroups
import backend.userGroups.UserGroupsRepository
import backend.userLevel.UserLevel
import backend.users.UsersRepository
import backend.users.Users
import backend.users.UsersRoles
import backend.utils.UserMapper
import backend.weekdays.Weekdays
import backend.weekdays.WeekdaysRepository
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.transaction.annotation.Transactional
import java.sql.Time
import java.time.LocalDateTime

@DgsComponent
class GroupsDataFetcher {

    @Autowired
    private lateinit var awardRepository: AwardRepository

    @Autowired
    private lateinit var awardsPermissions: AwardsPermissions

    @Autowired
    private lateinit var groupsPermissions: GroupsPermissions

    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var photoAssigner: PhotoAssigner

    @Autowired
    private lateinit var levelsRepository: LevelsRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var bonusesRepository: BonusesRepository

    @Autowired
    lateinit var usersRepository: UsersRepository

    @Autowired
    lateinit var pointsRepository: PointsRepository

    @Autowired
    lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    lateinit var groupsRepository: GroupsRepository

    @Autowired
    lateinit var editionRepository: EditionRepository

    @Autowired
    lateinit var fileRepository: FileEntityRepository

    @Autowired
    lateinit var userGroupsRepository: UserGroupsRepository

    @Autowired
    lateinit var weekdaysRepository: WeekdaysRepository

    @Autowired
    lateinit var usersDataFetcher: UsersDataFetcher

    @DgsQuery
    @Transactional
    fun listSetupGroups(@InputArgument editionId: Long): List<GroupWithPermissions> {
        val action = "listSetupGroups"
        val arguments = mapOf(
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action,
            objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }

        val groups = groupsRepository.findByEdition(edition).map { group ->
            GroupWithPermissions(
                group = GroupOutputType(
                    groupsId = group.groupsId,
                    groupName = group.groupName,
                    generatedName = group.generatedName,
                    usosId = group.usosId,
                    label = group.label,
                    teacher = group.teacher,
                    userGroups = group.userGroups.filter { it.user.role == UsersRoles.STUDENT }.toSet(),
                    weekday = group.weekday,
                    startTime = group.startTime,
                    endTime = group.endTime,
                    edition = group.edition,
                    imageFile = group.imageFile
                ),
                permissions = ListPermissionsOutput(
                    canAdd = Permission(
                        "addGroup",
                        objectMapper.createObjectNode(),
                        false,
                        "Not applicable"),
                    canEdit = permissionService.checkPartialPermission(PermissionInput("editGroupWithUsers", objectMapper.writeValueAsString(mapOf("groupId" to group.groupsId)))),
                    canCopy =
                    Permission(
                        "copyGroup",
                        objectMapper.createObjectNode(),
                        false,
                        "Not applicable"),
                    canRemove = permissionService.checkPartialPermission(PermissionInput("removeGroup", objectMapper.writeValueAsString(mapOf("groupId" to group.groupsId)))),
                    canSelect =
                    Permission(
                        "selectGroup",
                        objectMapper.createObjectNode(),
                        false,
                        "Not applicable"),
                    canUnselect =
                    Permission(
                        "unselectGroup",
                        objectMapper.createObjectNode(),
                        false,
                        "Not applicable"),
                    additional = emptyList()
                )
            )
        }
        return groups
    }

    @DgsMutation
    @Transactional
    fun assignPhotosToGroups(@InputArgument editionId: Long): Boolean {
        val action = "assignPhotosToGroups"
        val arguments = mapOf("editionId" to editionId)
        val permissionInput = PermissionInput(
            action,
            objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }


        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }

        val groups = groupsRepository.findByEdition(edition)

        val photosForGroups = fileRepository.findAllByFileType("image/group")

        val shuffledPhotos = photosForGroups.shuffled()

        groups.zip(shuffledPhotos).forEach { (group, photo) ->
            group.imageFile = photo
            groupsRepository.save(group)
        }

        return true
    }

    @DgsMutation
    @Transactional
    fun addGroup(@InputArgument editionId: Long, @InputArgument usosId: Int,
                 @InputArgument weekdayId: Long, @InputArgument startTime: String,
                 @InputArgument endTime: String, @InputArgument teacherId: Long, @InputArgument label: String = "",
                 @InputArgument groupName: String = ""): Groups {
        val action = "addGroup"
        val arguments = mapOf(
            "editionId" to editionId,
            "usosId" to usosId,
            "weekdayId" to weekdayId,
            "startTime" to startTime,
            "endTime" to endTime,
            "teacherId" to teacherId,
            "label" to label,
            "groupName" to groupName
        )
        val permissionInput = PermissionInput(
            action,
            objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }


        val startTimeWithSeconds = Time.valueOf("$startTime:00")
        val endTimeWithSeconds = Time.valueOf("$endTime:00")

        val edition = editionRepository.findById(editionId).orElseThrow() { IllegalArgumentException("Invalid edition ID") }

        val weekday = weekdaysRepository.findById(weekdayId).orElseThrow { IllegalArgumentException("Invalid weekday ID") }
        val teacher = usersRepository.findById(teacherId).orElseThrow { IllegalArgumentException("Invalid teacher ID") }
        val generatedName = generateGroupName(usosId, weekday, startTimeWithSeconds, teacher)
        val group = Groups(
            generatedName = generatedName,
            groupName = groupName,
            usosId = usosId,
            label = label,
            teacher = teacher,
            weekday = weekday,
            startTime = startTimeWithSeconds,
            endTime = endTimeWithSeconds,
            edition = edition
        )
        groupsRepository.save(group)
        val filesFromGroupInEdition = groupsRepository.findByEdition(edition).mapNotNull { it.imageFile }
        val file = fileRepository.findAllByFileType("image/group").filter { it !in filesFromGroupInEdition }.shuffled().firstOrNull()
        val fileId = file?.fileId ?: fileRepository.findAllByFileType("image/group").shuffled().firstOrNull()?.fileId
        photoAssigner.assignPhotoToAssignee(groupsRepository, "image/group", group.groupsId, fileId)
        val userGroups = UserGroups(
            user = teacher,
            group = group
        )
        userGroupsRepository.save(userGroups)
        return group
    }

    @DgsMutation
    @Transactional
    fun addGroupWithUsers(@InputArgument editionId: Long, @InputArgument usosId: Int,
                          @InputArgument weekdayId: Long, @InputArgument startTime: String,
                          @InputArgument endTime: String, @InputArgument teacherId: Long, @InputArgument label: String = "",
                          @InputArgument groupName: String = "", @InputArgument users: List<UsersInputType>): Groups {
        val action = "addGroupWithUsers"
        val usersMap = users.map { user ->
            mapOf(
                "indexNumber" to user.indexNumber,
                "nick" to user.nick,
                "firstName" to user.firstName,
                "secondName" to user.secondName,
                "role" to user.role,
                "email" to user.email,
                "label" to user.label,
                "createFirebaseUser" to user.createFirebaseUser,
                "sendEmail" to user.sendEmail,
                "imageFileId" to user.imageFileId
            )
        }
        val arguments = mapOf(
            "editionId" to editionId,
            "usosId" to usosId,
            "weekdayId" to weekdayId,
            "startTime" to startTime,
            "endTime" to endTime,
            "teacherId" to teacherId,
            "label" to label,
            "groupName" to groupName,
            "users" to usersMap
        )
        val permissionInput = PermissionInput(
            action,
            objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val hh_mm = Regex("([01]?[0-9]|2[0-3]):[0-5][0-9]")
        if (!hh_mm.matches(startTime) || !hh_mm.matches(endTime)) {
            throw IllegalArgumentException("Invalid time format")
        }

        val startTimeWithSeconds = Time.valueOf("$startTime:00")
        val endTimeWithSeconds = Time.valueOf("$endTime:00")

        val edition = editionRepository.findById(editionId).orElseThrow() { IllegalArgumentException("Invalid edition ID") }
        val weekday = weekdaysRepository.findById(weekdayId).orElseThrow { IllegalArgumentException("Invalid weekday ID") }
        val teacher = usersRepository.findById(teacherId).orElseThrow { IllegalArgumentException("Invalid teacher ID") }
        val generatedName = generateGroupName(usosId, weekday, startTimeWithSeconds, teacher)
        val group = Groups(
            generatedName = generatedName,
            groupName = groupName,
            usosId = usosId,
            label = label,
            teacher = teacher,
            weekday = weekday,
            startTime = startTimeWithSeconds,
            endTime = endTimeWithSeconds,
            edition = edition
        )
        groupsRepository.save(group)

        val filesFromGroupInEdition = groupsRepository.findByEdition(edition).mapNotNull { it.imageFile }
        val file = fileRepository.findAllByFileType("image/group").filter { it !in filesFromGroupInEdition }.shuffled().firstOrNull()
        val fileId = file?.fileId ?: fileRepository.findAllByFileType("image/group").shuffled().firstOrNull()?.fileId
        photoAssigner.assignPhotoToAssignee(groupsRepository, "image/group", group.groupsId, fileId)

        val userGroups = UserGroups(
            user = teacher,
            group = group
        )
        userGroupsRepository.save(userGroups)

        users.forEach {
            val user = if (!usersRepository.existsByIndexNumber(it.indexNumber)) {
                usersDataFetcher.addUserHelper(
                    it.indexNumber,
                    it.nick,
                    it.firstName,
                    it.secondName,
                    it.role,
                    it.email,
                    it.label,
                    it.createFirebaseUser,
                    it.sendEmail,
                    it.imageFileId
                )
            } else {
                usersRepository.findByIndexNumber(it.indexNumber)
                    ?: throw IllegalArgumentException("User with index number ${it.indexNumber} not found")
            }
            val userGroup = UserGroups(
                user = user,
                group = group
            )
            userGroupsRepository.save(userGroup)
        }
        return group
    }


    @DgsMutation
    @Transactional
    fun editGroup(
        @InputArgument groupId: Long,
        @InputArgument groupName: String?,
        @InputArgument usosId: Int?,
        @InputArgument weekdayId: Long?,
        @InputArgument startTime: String?,
        @InputArgument endTime: String?,
        @InputArgument teacherId: Long?,
        @InputArgument label: String?
    ): Groups {
        val action = "editGroup"
        val arguments = mapOf(
            "groupId" to groupId,
            "groupName" to groupName,
            "usosId" to usosId,
            "weekdayId" to weekdayId,
            "startTime" to startTime,
            "endTime" to endTime,
            "teacherId" to teacherId,
            "label" to label
        )
        val permissionInput = PermissionInput(
            action,
            objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val group = groupsRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Invalid group ID") }


        groupName?.let {
            group.groupName = it
        }

        usosId?.let {
            group.usosId = it
        }

        weekdayId?.let {
            val weekday = weekdaysRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Invalid weekday ID") }
            group.weekday = weekday
        }

        startTime?.let {
            group.startTime = Time.valueOf("$startTime:00")
        }

        endTime?.let {
            group.endTime = Time.valueOf("$endTime:00")
        }

        teacherId?.let {
            val teacher = usersRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Invalid teacher ID") }
            group.teacher = teacher
        }

        label?.let {
            group.label = it
        }

        group.generatedName = generateGroupName(group.usosId, group.weekday, group.startTime, group.teacher)

        return groupsRepository.save(group)
    }

    @DgsMutation
    @Transactional
    fun editGroupWithUsers(
        @InputArgument groupId: Long,
        @InputArgument groupName: String?,
        @InputArgument usosId: Int?,
        @InputArgument weekdayId: Long?,
        @InputArgument startTime: String?,
        @InputArgument endTime: String?,
        @InputArgument teacherId: Long?,
        @InputArgument label: String?,
        @InputArgument users: UserIdsType
    ): Groups {
        val action = "editGroupWithUsers"
        val arguments = mapOf(
            "groupId" to groupId,
            "groupName" to groupName,
            "usosId" to usosId,
            "weekdayId" to weekdayId,
            "startTime" to startTime,
            "endTime" to endTime,
            "teacherId" to teacherId,
            "label" to label,
            "users" to mapOf(
                "userIds" to users.userIds
            )
        )
        val permissionInput = PermissionInput(
            action,
            objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val group = groupsRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Invalid group ID") }

        groupName?.let {
            group.groupName = it
        }

        usosId?.let {
            group.usosId = it
        }

        weekdayId?.let {
            val weekday = weekdaysRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Invalid weekday ID") }
            group.weekday = weekday
        }

        startTime?.let {
            group.startTime = Time.valueOf("$startTime:00")
        }

        endTime?.let {
            group.endTime = Time.valueOf("$endTime:00")
        }

        teacherId?.let {
            val teacher = usersRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Invalid teacher ID") }
            group.teacher = teacher
        }

        label?.let {
            group.label = it
        }

        group.generatedName = generateGroupName(group.usosId, group.weekday, group.startTime, group.teacher)

        val existingUsers = usersRepository.findByUserGroups_Group_GroupsId(groupId)
        val inputUserIds = users.userIds.toSet()

        // Remove userGroups not in input list
        existingUsers.filter { it.userId !in inputUserIds }.filter { it.role == UsersRoles.STUDENT }
            .forEach { userGroupsRepository.deleteByUserAndGroup(it, group) }

        // users that are not in the group yet
        users.userIds.filter { userId -> userId !in existingUsers.map { it.userId } }
            .forEach { userId ->
                val user = usersRepository.findById(userId)
                    .orElseThrow { IllegalArgumentException("Invalid User ID: $userId") }

                val userGroup = UserGroups(
                    user = user,
                    group = group
                )
                userGroupsRepository.save(userGroup)
            }

        return groupsRepository.save(group)
    }

    @DgsMutation
    @Transactional
    fun removeGroup(@InputArgument groupId: Long): Boolean {
        val action = "removeGroup"
        val arguments = mapOf(
            "groupId" to groupId
        )
        val permissionInput = PermissionInput(
            action,
            objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }


        val group = groupsRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Invalid group ID") }

        userGroupsRepository.findByGroup_GroupsId(groupId).forEach(userGroupsRepository::delete)

        return removeGroupHelper(groupId)
    }

    @DgsQuery
    @Transactional
    fun getPossibleGroupsWeekdays(@InputArgument editionId: Long): List<Weekdays> {
        val action = "getPossibleGroupsWeekdays"
        val arguments = mapOf(
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action,
            objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason)
        }

        val edition = editionRepository
            .findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val groups = groupsRepository.findByEdition(edition)
        val weekdays = groups.map { it.weekday }.distinct().sortedBy { it.ordinalNumber }
        return weekdays
    }

    @DgsQuery
    @Transactional
    fun getPossibleGroupsTimeSpans(@InputArgument editionId: Long): List<TimeSpansType> {
        val action = "getPossibleGroupsTimeSpans"
        val arguments = mapOf(
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action,
            objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val edition = editionRepository
            .findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val groups = groupsRepository.findByEdition(edition)
        return groups.map { TimeSpansType(it.startTime, it.endTime) }
            .distinct()
            .sortedWith(compareBy({ it.startTime }, { it.endTime }))
    }

    @DgsQuery
    @Transactional
    fun getPossibleGroupDates(@InputArgument editionId: Long): List<GroupDateType> {
        val action = "getPossibleGroupDates"
        val arguments = mapOf(
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action,
            objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val edition = editionRepository
            .findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val groups = groupsRepository.findByEdition(edition)
        return groups.map { GroupDateType(it.weekday, it.startTime, it.endTime) }.distinct()
    }

    @DgsQuery
    @Transactional
    @Cacheable("usersInGroupWithPoints")
    fun getUsersInGroupWithPoints(@InputArgument groupId: Long): List<UserPointsType> {
        val action = "getUsersInGroupWithPoints"
        val arguments = mapOf(
            "groupId" to groupId
        )
        val permissionInput = PermissionInput(
            action,
            objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val group = groupsRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Invalid group ID") }

        val users = usersRepository.findByUserGroups_Group_GroupsIdAndRole(groupId, UsersRoles.STUDENT)
        val userIds = users.map { it.userId }

        val points = pointsRepository.findByStudent_UserIdInAndSubcategory_Edition(userIds, group.edition)
        val bonuses = bonusesRepository.findByChestHistory_User_UserIdInAndPoints_Subcategory_Edition(userIds, group.edition)
        val categories = categoriesRepository.findByCategoryEdition_EditionAndCanAddPoints(group.edition, true)
        val subcategories = subcategoriesRepository.findByEdition_EditionId(group.edition.editionId)
        val subcategoriesByCategory = subcategories.groupBy { it.category.categoryId }
        val allAvailableAwards = awardRepository.findByAwardEditions_Edition(group.edition).distinctBy { it.awardId }
        val awardsByCategory = allAvailableAwards.groupBy { it.category.categoryId }


        // Pre-process data into maps
        val purePointsByUserAndCategory = points.filter { it.bonuses == null }.groupBy { it.student.userId }
            .mapValues { it.value.groupBy { it.subcategory.category.categoryId } }
        val bonusesByUserAndCategory = bonuses.groupBy { it.points.student.userId }
            .mapValues { it.value.groupBy { it.points.subcategory.category.categoryId } }

        return users.map { user ->
            UserPointsType(
                user = user,
                userLevel = user.userLevels.find { it.edition == group.edition } ?: UserLevel(),
                categoriesPoints = categories.map { category ->
                    val categoryPurePoints = purePointsByUserAndCategory[user.userId]?.get(category.categoryId) ?: emptyList()
                    val categoryBonuses = bonusesByUserAndCategory[user.userId]?.get(category.categoryId) ?: emptyList()
                    val categoryBonusesByAward = categoryBonuses.groupBy { it.award }
                    val awardTypes = awardsByCategory[category.categoryId] ?: emptyList()

                    CategoryPointsType(
                        category = category,
                        subcategoryPoints = subcategoriesByCategory[category.categoryId]?.sortedBy{ it.ordinalNumber }?.map { subcategory ->
                            val subcategoryPurePoints = categoryPurePoints.firstOrNull { it.subcategory == subcategory }
                            SubcategoryPointsGroupType(
                                subcategory = subcategory,
                                points = subcategoryPurePoints,
                                teacher = subcategoryPurePoints?.teacher ?: Users(),
                                createdAt = subcategoryPurePoints?.createdAt ?: LocalDateTime.now(),
                                updatedAt = subcategoryPurePoints?.updatedAt ?: LocalDateTime.now()
                            )
                        } ?: emptyList(),
                        categoryAggregate = CategoryAggregate(
                            category = category,
                            sumOfPurePoints = categoryPurePoints.sumOf { it.value }.toFloat(),
                            sumOfBonuses = categoryBonuses.sumOf { it.points.value }.toFloat(),
                            sumOfAll = categoryPurePoints.sumOf { it.value }.toFloat() +
                                    categoryBonuses.sumOf { it.points.value }.toFloat(),
                        ),
                        awardAggregate = awardTypes.map { awardType ->
                            val awardPoints = categoryBonusesByAward[awardType]?.map { it.points } ?: emptyList()
                            val awardPointsSum = if (awardPoints.isNotEmpty()) {
                                awardPoints.sumOf { it.value }.toFloat()
                            } else {
                                null
                            }
                            AwardAggregate(
                                award = awardType,
                                sumOfAll = awardPointsSum
                            )
                        }
                    )
                }.sortedBy { it.category.categoryId }
            )
        }
    }


    @DgsQuery
    @Transactional
    fun getGroupsInEdition(@InputArgument editionId: Long, @InputArgument teacherId: Long): List<GroupTeacherType> {
        val action = "getGroupsInEdition"
        val arguments = mapOf(
            "editionId" to editionId,
            "teacherId" to teacherId
        )
        val permissionInput = PermissionInput(
            action,
            objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val teacher = usersRepository.findById(teacherId).orElseThrow { IllegalArgumentException("Invalid teacher ID") }
        val groups = groupsRepository.findByEdition(edition)
        return groups.map { group ->
            GroupTeacherType(
                group = group,
                owns = group.teacher == teacher,
                canEdit = group.teacher == teacher || teacher.role == UsersRoles.COORDINATOR
            )
        }
    }

    @Transactional
    fun removeGroupHelper(groupId: Long): Boolean {
        val permission = groupsPermissions.checkRemoveGroupHelperPermission(groupId)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val group = groupsRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Invalid group ID") }

        userGroupsRepository.findByGroup_GroupsId(groupId).forEach(userGroupsRepository::delete)

        groupsRepository.delete(group)
        return true
    }

//    private fun getUserCategoriesWithDefaults(categories: List<Categories>, userPoints: List<CategoryPointsType>, subcategories: List<Subcategories>): List<CategoryPointsType> {
//        return categories.filter{it.canAddPoints}.map { category ->
//            userPoints.find { it.category == category } ?: CategoryPointsType(
//                category = category,
//                subcategoryPoints = subcategories.filter { it.category == category }.map { subcat ->
//                    SubcategoryPointsType(
//                        subcategory = subcat,
//                        points = PurePointsType(
//                            purePoints = null,
//                            partialBonusType = emptyList()
//                        ),
//                        teacher = Users(),
//                        createdAt = LocalDateTime.now(),
//                        updatedAt = LocalDateTime.now()
//                    )
//                },
//                categoryAggregate = CategoryAggregate(
//                    category = category,
//                    sumOfPurePoints = 0f,
//                    sumOfBonuses = 0f,
//                    sumOfAll = 0f
//                )
//            )
//        }
//    }
//
//    private fun getSubcategoryPointsWithDefaults(subcategoryPoints: List<SubcategoryPointsType>, subcategories: List<Subcategories>, category: Categories): List<SubcategoryPointsType> {
//        val allSubcategoriesForCategory = subcategories.filter { it.category == category }
//        return allSubcategoriesForCategory.map { subcat ->
//            subcategoryPoints.find { it.subcategory == subcat } ?: SubcategoryPointsType(
//                subcategory = subcat,
//                points = PurePointsType(
//                    purePoints = null,
//                    partialBonusType = emptyList()
//                ),
//                teacher = Users(),
//                createdAt = LocalDateTime.now(),
//                updatedAt = LocalDateTime.now()
//            )
//        }
//    }
//
//    private fun createCategoryPointsType(category: Categories, subcategoryPoints: List<SubcategoryPointsType>, subcategories: List<Subcategories>): CategoryPointsType{
//        val subcategoryPointsWithDefaults = getSubcategoryPointsWithDefaults(subcategoryPoints, subcategories, category)
//
//        val sumOfPurePoints = BigDecimal(subcategoryPointsWithDefaults.sumOf { it.points.purePoints?.value?.toDouble() ?: 0.0 }.toString()).setScale(2, RoundingMode.HALF_UP).toFloat()
//        val sumOfBonuses = BigDecimal(subcategoryPointsWithDefaults.sumOf { subcategory ->
//            subcategory.points.partialBonusType.sumOf { it.partialValue.toDouble() }
//        }.toString()).setScale(2, RoundingMode.HALF_UP).toFloat()
//        val sumOfAll = BigDecimal((sumOfPurePoints + sumOfBonuses).toString()).setScale(2, RoundingMode.HALF_UP).toFloat()
//
//        return CategoryPointsType(
//            category = category,
//            subcategoryPoints = subcategoryPointsWithDefaults,
//            categoryAggregate = CategoryAggregate(
//                category = category,
//                sumOfPurePoints = sumOfPurePoints,
//                sumOfBonuses = sumOfBonuses,
//                sumOfAll = sumOfAll
//            )
//        )
//    }
    private fun generateGroupName(usosId: Int, weekday: Weekdays, startTime: Time, teacher: Users): String {
        return "${weekday.weekdayAbbr}-${startTime.toString().replace(":", "").subSequence(0, 4)}-${teacher.firstName.subSequence(0, 3)}-${teacher.secondName.subSequence(0, 3)}-${usosId}"
    }
}

data class UserPointsType(
    val user: Users,
    val userLevel: UserLevel,
    val categoriesPoints: List<CategoryPointsType>,
)

data class CategoryPointsType(
    val category: Categories,
    val subcategoryPoints: List<SubcategoryPointsGroupType>,
    val awardAggregate: List<AwardAggregate>,
    val categoryAggregate: CategoryAggregate
)

data class AwardAggregate(
    val award: Award,
    val sumOfAll: Float?
)

data class CategoryAggregate(
    val category: Categories,
    val sumOfPurePoints: Float,
    val sumOfBonuses: Float,
    val sumOfAll: Float
)

data class SubcategoryPointsType(
    val subcategory: Subcategories,
    val points: PurePointsType,
    val teacher: Users,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class SubcategoryPointsGroupType(
    val subcategory: Subcategories,
    val points: Points?,
    val teacher: Users,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class PurePointsType(
    val purePoints: Points?,
    var partialBonusType: List<PartialBonusType>
)

data class PartialBonusType(
    val bonuses: Bonuses,
    val partialValue: Float
)

data class TimeSpansType(
    val startTime: Time,
    val endTime: Time
)

data class GroupDateType(
    val weekday: Weekdays,
    val startTime: Time,
    val endTime: Time
)

data class GroupTeacherType(
    val group: Groups,
    val owns: Boolean,
    val canEdit: Boolean
)

data class UsersInputType (
    val indexNumber: Int,
    val nick: String,
    val firstName: String,
    val secondName: String,
    val role: String,
    val email: String,
    val label: String,
    val imageFileId: Long?,
    val createFirebaseUser: Boolean,
    val sendEmail: Boolean
)

data class UserIdsType(
    val userIds: List<Long>
)

data class GroupWithPermissions(
    val group: GroupOutputType,
    val permissions: ListPermissionsOutput
)

data class GroupOutputType (
    val groupsId: Long = 0,
    var groupName: String? = "",
    var generatedName: String,
    var usosId: Int,
    var label: String? = "",
    var teacher: Users,
    val userGroups: Set<UserGroups>,
    var weekday: Weekdays,
    var startTime: Time,
    var endTime: Time,
    var edition: Edition,
    val imageFile: FileEntity? = null
)
