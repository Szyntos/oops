package backend.graphql

import backend.award.AwardType
import backend.bonuses.Bonuses
import backend.bonuses.BonusesRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.groups.Groups
import backend.groups.GroupsRepository
import backend.points.Points
import backend.points.PointsRepository
import backend.subcategories.Subcategories
import backend.subcategories.SubcategoriesRepository
import backend.userGroups.UserGroups
import backend.userGroups.UserGroupsRepository
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
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.sql.Time
import java.time.LocalDateTime
import kotlin.math.min

@DgsComponent
class GroupsDataFetcher {
    @Autowired
    private lateinit var photoAssigner: PhotoAssigner

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

    @DgsMutation
    @Transactional
    fun assignPhotosToGroups(@InputArgument editionId: Long): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can assign photos to groups")
        }

        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }
        val groups = groupsRepository.findByEdition(edition)

        val photosForGroups = fileRepository.findAllByFileType("image/group")

        if (groups.size > photosForGroups.size) {
            throw IllegalArgumentException("Not enough photos to assign to all groups. Missing ${groups.size - photosForGroups.size} photos." +
                    " Please upload more photos with fileType = image/group and try again.")
        }

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
                 @InputArgument weekdayId: Long, @InputArgument startTime: Time,
                 @InputArgument endTime: Time, @InputArgument teacherId: Long, @InputArgument label: String = "",
                 @InputArgument groupName: String = ""): Groups {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can add groups")
        }

        val edition = editionRepository.findById(editionId).orElseThrow() { IllegalArgumentException("Invalid edition ID") }
        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }
        if (groupsRepository.existsByUsosIdAndEdition(usosId.toLong(), edition)) {
            throw IllegalArgumentException("Group with USOS ID $usosId already exists for edition ${edition.editionId}")
        }
        if (groupsRepository.findAllByGroupNameAndEdition(groupName, edition).any { it.groupName.isNotBlank() }) {
            throw IllegalArgumentException("Group with name $groupName already exists for edition ${edition.editionId}")
        }
        if (startTime.after(endTime)) {
            throw IllegalArgumentException("Start time must be before end time")
        }
        if (startTime == endTime) {
            throw IllegalArgumentException("Start time must be different from end time")
        }
        val weekday = weekdaysRepository.findById(weekdayId).orElseThrow { IllegalArgumentException("Invalid weekday ID") }
        val teacher = usersRepository.findById(teacherId).orElseThrow { IllegalArgumentException("Invalid teacher ID") }
        if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("User with ID $teacherId is not a teacher nor a coordinator")
        }
        if (groupsRepository.existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(teacher, weekday, startTime, endTime, edition)) {
            throw IllegalArgumentException("Teacher is already teaching a group at this time")
        }
        val generatedName = generateGroupName(usosId, weekday, startTime, teacher)
        val group = Groups(
            generatedName = generatedName,
            groupName = groupName,
            usosId = usosId,
            label = label,
            teacher = teacher,
            weekday = weekday,
            startTime = startTime,
            endTime = endTime,
            edition = edition
        )
        groupsRepository.save(group)
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
                          @InputArgument weekdayId: Long, @InputArgument startTime: Time,
                          @InputArgument endTime: Time, @InputArgument teacherId: Long, @InputArgument label: String = "",
                          @InputArgument groupName: String = "", @InputArgument users: List<UsersInputType>): Groups {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can add groups")
        }

        val edition = editionRepository.findById(editionId).orElseThrow() { IllegalArgumentException("Invalid edition ID") }
        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }
        if (groupsRepository.existsByUsosIdAndEdition(usosId.toLong(), edition)) {
            throw IllegalArgumentException("Group with USOS ID $usosId already exists for edition ${edition.editionId}")
        }
        if (groupsRepository.findAllByGroupNameAndEdition(groupName, edition).any { it.groupName.isNotBlank() }) {
            throw IllegalArgumentException("Group with name $groupName already exists for edition ${edition.editionId}")
        }
        if (startTime.after(endTime)) {
            throw IllegalArgumentException("Start time must be before end time")
        }
        if (startTime == endTime) {
            throw IllegalArgumentException("Start time must be different from end time")
        }
        val weekday = weekdaysRepository.findById(weekdayId).orElseThrow { IllegalArgumentException("Invalid weekday ID") }
        val teacher = usersRepository.findById(teacherId).orElseThrow { IllegalArgumentException("Invalid teacher ID") }
        if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("User with ID $teacherId is not a teacher nor a coordinator")
        }
        if (groupsRepository.existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(teacher, weekday, startTime, endTime, edition)) {
            throw IllegalArgumentException("Teacher is already teaching a group at this time")
        }
        val generatedName = generateGroupName(usosId, weekday, startTime, teacher)
        val group = Groups(
            generatedName = generatedName,
            groupName = groupName,
            usosId = usosId,
            label = label,
            teacher = teacher,
            weekday = weekday,
            startTime = startTime,
            endTime = endTime,
            edition = edition
        )
        groupsRepository.save(group)
        photoAssigner.assignPhotoToAssignee(groupsRepository, "image/group", group.groupsId, null)
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
        @InputArgument startTime: Time?,
        @InputArgument endTime: Time?,
        @InputArgument teacherId: Long?,
        @InputArgument label: String?
    ): Groups {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            throw IllegalArgumentException("Student cannot edit groups")
        }

        val group = groupsRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Invalid group ID") }

        if (currentUser.role == UsersRoles.TEACHER){
            if (group.teacher.userId != currentUser.userId){
                throw IllegalArgumentException("Teacher can only edit their groups")
            }
            if (usosId != null || weekdayId != null || startTime != null || endTime != null || teacherId != null){
                throw IllegalArgumentException("Teacher can only edit groupName and label")
            }
        }

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }

        groupName?.let {
            if (it != "" && groupsRepository.existsByGroupNameAndEdition(it, group.edition) && it != group.groupName) {
                throw IllegalArgumentException("Group with name $it already exists for edition ${group.edition.editionId}")
            }
            group.groupName = it
        }

        usosId?.let {
            if (groupsRepository.existsByUsosIdAndEdition(it.toLong(), group.edition) && it != group.usosId) {
                throw IllegalArgumentException("Group with USOS ID $it already exists for edition ${group.edition.editionId}")
            }
            group.usosId = it
        }

        weekdayId?.let {
            val weekday = weekdaysRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Invalid weekday ID") }
            group.weekday = weekday
        }

        startTime?.let {
            if (endTime != null && it.after(endTime)) {
                throw IllegalArgumentException("Start time must be before end time")
            }
            group.startTime = it
        }

        endTime?.let {
            if (startTime != null && startTime.after(it)) {
                throw IllegalArgumentException("End time must be after start time")
            }
            group.endTime = it
        }

        teacherId?.let {
            val teacher = usersRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Invalid teacher ID") }
            if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
                throw IllegalArgumentException("User with ID $it is not a teacher nor a coordinator")
            }
            if (groupsRepository.existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(
                    teacher, group.weekday, group.startTime, group.endTime, group.edition
                ) && it != group.teacher.userId
            ) {
                throw IllegalArgumentException("Teacher is already teaching a group at this time")
            }
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
        @InputArgument startTime: Time?,
        @InputArgument endTime: Time?,
        @InputArgument teacherId: Long?,
        @InputArgument label: String?,
        @InputArgument users: UserIdsType
    ): Groups {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            throw IllegalArgumentException("Student cannot edit groups")
        }

        val group = groupsRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Invalid group ID") }

        if (currentUser.role == UsersRoles.TEACHER){
            if (group.teacher.userId != currentUser.userId){
                throw IllegalArgumentException("Teacher can only edit their groups")
            }
            if (usosId != null || weekdayId != null || startTime != null || endTime != null || teacherId != null){
                throw IllegalArgumentException("Teacher can only edit groupName and label")
            }
        }

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }

        groupName?.let {
            if (it != "" && groupsRepository.existsByGroupNameAndEdition(it, group.edition) && it != group.groupName) {
                throw IllegalArgumentException("Group with name $it already exists for edition ${group.edition.editionId}")
            }
            group.groupName = it
        }

        usosId?.let {
            if (groupsRepository.existsByUsosIdAndEdition(it.toLong(), group.edition) && it != group.usosId) {
                throw IllegalArgumentException("Group with USOS ID $it already exists for edition ${group.edition.editionId}")
            }
            group.usosId = it
        }

        weekdayId?.let {
            val weekday = weekdaysRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Invalid weekday ID") }
            group.weekday = weekday
        }

        startTime?.let {
            if (endTime != null && it.after(endTime)) {
                throw IllegalArgumentException("Start time must be before end time")
            }
            group.startTime = it
        }

        endTime?.let {
            if (startTime != null && startTime.after(it)) {
                throw IllegalArgumentException("End time must be after start time")
            }
            group.endTime = it
        }

        teacherId?.let {
            val teacher = usersRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Invalid teacher ID") }
            if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
                throw IllegalArgumentException("User with ID $it is not a teacher nor a coordinator")
            }
            if (groupsRepository.existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(
                    teacher, group.weekday, group.startTime, group.endTime, group.edition
                ) && it != group.teacher.userId
            ) {
                throw IllegalArgumentException("Teacher is already teaching a group at this time")
            }
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
                if (user.role != UsersRoles.STUDENT) {
                    throw IllegalArgumentException("User with ID $userId is not a student")
                }

                if (userGroupsRepository.existsByUserAndGroup(user, group)){
                    throw IllegalArgumentException("This User already exists in this Group")
                }

                if (userGroupsRepository.existsByUserAndGroup_Edition(user, group.edition)){
                    throw IllegalArgumentException("This User already exists in a group in this Edition")
                }

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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can remove groups")
        }

        val group = groupsRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Invalid group ID") }

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }

        userGroupsRepository.findByGroup_GroupsId(groupId).forEach(userGroupsRepository::delete)

        groupsRepository.delete(group)
        return true
    }

    @DgsQuery
    @Transactional
    fun getPossibleGroupsWeekdays(@InputArgument editionId: Long): List<Weekdays> {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == editionId }) {
                throw IllegalArgumentException("User is not in edition with ID $editionId")
            }
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == editionId }) {
                throw IllegalArgumentException("User is not in edition with ID $editionId")
            }
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == editionId }) {
                throw IllegalArgumentException("User is not in edition with ID $editionId")
            }
        }

        val edition = editionRepository
            .findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val groups = groupsRepository.findByEdition(edition)
        return groups.map { GroupDateType(it.weekday, it.startTime, it.endTime) }.distinct()
    }

    @DgsQuery
    @Transactional
    fun getUsersInGroupWithPoints(@InputArgument groupId: Long): List<UserPointsType> {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            throw IllegalArgumentException("Student cannot view users in groups")
        }
        if (currentUser.role == UsersRoles.TEACHER){
            val groupEdition = groupsRepository.findById(groupId).orElseThrow { IllegalArgumentException("Invalid group ID") }.edition
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == groupEdition.editionId }) {
                throw IllegalArgumentException("User is not in edition with ID ${groupEdition.editionId}")
            }
        }

        val group = groupsRepository.findById(groupId).orElseThrow { IllegalArgumentException("Invalid group ID") }
        val users = usersRepository.findByUserGroups_Group_GroupsId(groupId).filter { it.role == UsersRoles.STUDENT }
        val userIds = users.map { it.userId }
        val points = pointsRepository.findByStudent_UserIdIn(userIds).filter { it.subcategory.edition == group.edition }
        val bonuses = bonusesRepository.findByChestHistory_User_UserIdIn(userIds).filter { it.points.subcategory.edition == group.edition }
        val categories = categoriesRepository.findByCategoryEdition_Edition(group.edition)
        val subcategories = subcategoriesRepository.findByEdition_EditionId(group.edition.editionId)

        return users.map { user ->
            val userBonuses = bonuses.filter { it.chestHistory.user.userId == user.userId }

            val additivePrevBonuses = userBonuses.filter { it.award.awardType == AwardType.ADDITIVE_PREV }

            val additivePrevBonusesMap = additivePrevBonuses.associateWith { it.points.value }.toMutableMap()

            val userPoints = points.filter { it.student.userId == user.userId }
                .groupBy { it.subcategory }
                .mapNotNull { (subcategory, points) ->

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
                .groupBy { it.subcategory.category } // Grouping by category
                .map { (category, subcategoryPoints) ->
                    createCategoryPointsType(category, subcategoryPoints.sortedBy { it.subcategory.ordinalNumber }, subcategories)
                }

            // Ensure all categories are included
            val userCategoriesWithDefaults = getUserCategoriesWithDefaults(categories, userPoints, subcategories)

            UserPointsType(user, userCategoriesWithDefaults)
        }
    }

    @DgsQuery
    @Transactional
    fun getGroupsInEdition(@InputArgument editionId: Long, @InputArgument teacherId: Long): List<GroupTeacherType> {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            throw IllegalArgumentException("Student cannot view groups")
        }
        if (currentUser.role == UsersRoles.TEACHER){
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == editionId }) {
                throw IllegalArgumentException("User is not in edition with ID $editionId")
            }
        }

        val edition = editionRepository.findById(editionId).orElseThrow { IllegalArgumentException("Invalid edition ID") }
        val teacher = usersRepository.findById(teacherId).orElseThrow { IllegalArgumentException("Invalid teacher ID") }
        if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("User with ID $teacherId is not a teacher nor a coordinator")
        }
        val groups = groupsRepository.findByEdition(edition)
        return groups.map { group ->
            GroupTeacherType(
                group = group,
                owns = group.teacher == teacher,
                canEdit = group.teacher == teacher || teacher.role == UsersRoles.COORDINATOR
            )
        }
    }

    private fun getUserCategoriesWithDefaults(categories: List<Categories>, userPoints: List<CategoryPointsType>, subcategories: List<Subcategories>): List<CategoryPointsType> {
        return categories.filter{it.canAddPoints}.map { category ->
            userPoints.find { it.category == category } ?: CategoryPointsType(
                category = category,
                subcategoryPoints = subcategories.filter { it.category == category }.map { subcat ->
                    SubcategoryPointsType(
                        subcategory = subcat,
                        points = PurePointsType(
                            purePoints = null,
                            partialBonusType = emptyList()
                        ),
                        teacher = Users(),
                        createdAt = LocalDateTime.now(),
                        updatedAt = LocalDateTime.now()
                    )
                },
                aggregate = CategoryAggregate(
                    category = category,
                    sumOfPurePoints = 0f,
                    sumOfBonuses = 0f,
                    sumOfAll = 0f
                )
            )
        }
    }

    private fun getSubcategoryPointsWithDefaults(subcategoryPoints: List<SubcategoryPointsType>, subcategories: List<Subcategories>, category: Categories): List<SubcategoryPointsType> {
        val allSubcategoriesForCategory = subcategories.filter { it.category == category }
        return allSubcategoriesForCategory.map { subcat ->
            subcategoryPoints.find { it.subcategory == subcat } ?: SubcategoryPointsType(
                subcategory = subcat,
                points = PurePointsType(
                    purePoints = null,
                    partialBonusType = emptyList()
                ),
                teacher = Users(),
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now()
            )
        }
    }

    private fun createCategoryPointsType(category: Categories, subcategoryPoints: List<SubcategoryPointsType>, subcategories: List<Subcategories>): CategoryPointsType{
        val subcategoryPointsWithDefaults = getSubcategoryPointsWithDefaults(subcategoryPoints, subcategories, category)

        val sumOfPurePoints = BigDecimal(subcategoryPointsWithDefaults.sumOf { it.points.purePoints?.value?.toDouble() ?: 0.0 }.toString()).setScale(2, RoundingMode.HALF_UP).toFloat()
        val sumOfBonuses = BigDecimal(subcategoryPointsWithDefaults.sumOf { subcategory ->
            subcategory.points.partialBonusType.sumOf { it.partialValue.toDouble() }
        }.toString()).setScale(2, RoundingMode.HALF_UP).toFloat()
        val sumOfAll = BigDecimal((sumOfPurePoints + sumOfBonuses).toString()).setScale(2, RoundingMode.HALF_UP).toFloat()

        return CategoryPointsType(
            category = category,
            subcategoryPoints = subcategoryPointsWithDefaults,
            aggregate = CategoryAggregate(
                category = category,
                sumOfPurePoints = sumOfPurePoints,
                sumOfBonuses = sumOfBonuses,
                sumOfAll = sumOfAll
            )
        )
    }
    private fun generateGroupName(usosId: Int, weekday: Weekdays, startTime: Time, teacher: Users): String {
        return "${weekday.weekdayAbbr}-${startTime.toString().replace(":", "").subSequence(0, 4)}-${teacher.firstName.subSequence(0, 3)}-${teacher.secondName.subSequence(0, 3)}-${usosId}"
    }
}

data class UserPointsType(
    val user: Users,
    val categoriesPoints: List<CategoryPointsType>
)

data class CategoryPointsType(
    val category: Categories,
    val subcategoryPoints: List<SubcategoryPointsType>,
    val aggregate: CategoryAggregate
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

data class PurePointsType(
    val purePoints: Points?,
    val partialBonusType: List<PartialBonusType>
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
