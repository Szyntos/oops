package backend.graphql.permissions

import backend.award.AwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.utils.PhotoAssigner
import backend.groups.GroupsRepository
import backend.graphql.utils.Permission
import backend.userGroups.UserGroupsRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getIntField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.JsonNodeExtensions.getTimeField
import backend.utils.JsonNodeExtensions.getUserIdsType
import backend.utils.JsonNodeExtensions.getUsersInputTypeList
import backend.utils.UserMapper
import backend.weekdays.WeekdaysRepository
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.sql.Time
import kotlin.jvm.optionals.getOrNull

@Service
class GroupsPermissions {

    @Autowired
    private lateinit var usersPermissions: UsersPermissions

    @Autowired
    private lateinit var userGroupsRepository: UserGroupsRepository

    @Autowired
    private lateinit var usersRepository: UsersRepository

    @Autowired
    private lateinit var weekdaysRepository: WeekdaysRepository

    @Autowired
    private lateinit var fileEntityRepository: FileEntityRepository

    @Autowired
    private lateinit var groupsRepository: GroupsRepository

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

    fun checkListSetupGroupsPermission(arguments: JsonNode): Permission{
        val action = "listSetupGroups"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can list setup groups"
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

    fun checkAssignPhotosToGroupsPermission(arguments: JsonNode): Permission {
        val action = "assignPhotosToGroups"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can assign photos to groups"
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

        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }
        val groups = groupsRepository.findByEdition(edition)

        val photosForGroups = fileEntityRepository.findAllByFileType("image/group")

        if (groups.size > photosForGroups.size) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Not enough photos to assign to all groups. Missing ${groups.size - photosForGroups.size} photos." +
                        " Please upload more photos with fileType = image/group and try again."
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddGroupPermission(arguments: JsonNode): Permission {
        val action = "addGroup"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add groups"
            )
        }

//        @InputArgument editionId: Long, @InputArgument usosId: Int,
//        @InputArgument weekdayId: Long, @InputArgument startTime: Time,
//        @InputArgument endTime: Time, @InputArgument teacherId: Long, @InputArgument label: String = "",
//        @InputArgument groupName: String = ""

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val usosId = arguments.getIntField("usosId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'usosId'"
        )

        val weekdayId = arguments.getLongField("weekdayId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'weekdayId'"
        )

        val startTime = arguments.getStringField("startTime") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'startTime'"
        )

        val endTime = arguments.getStringField("endTime") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'endTime'"
        )

        val teacherId = arguments.getLongField("teacherId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'teacherId'"
        )

        val groupName = arguments.getStringField("groupName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'groupName'"
        )

        val hh_mm = Regex("([01]?[0-9]|2[0-3]):[0-5][0-9]")
        if (!hh_mm.matches(startTime) || !hh_mm.matches(endTime)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid time format, must be HH:MM"
            )
        }

        val startTimeWithSeconds = Time.valueOf("$startTime:00")
        val endTimeWithSeconds = Time.valueOf("$endTime:00")


        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )
        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }
        if (edition.levelSet == null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Cannot add a group to an edition without levels"
            )
        }
        if (groupsRepository.existsByUsosIdAndEdition(usosId.toLong(), edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Group with USOS ID $usosId already exists for edition ${edition.editionId}"
            )
        }
        if (groupsRepository.findAllByGroupNameAndEdition(groupName, edition).any { it.groupName?.isNotBlank() == true }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Group with name $groupName already exists for edition ${edition.editionId}"
            )
        }
        if (startTimeWithSeconds.after(endTimeWithSeconds)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Start time must be before end time"
            )
        }
        if (startTimeWithSeconds == endTimeWithSeconds) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Start time must be different from end time"
            )
        }
        val weekday = weekdaysRepository.findById(weekdayId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid weekday ID"
            )
        val teacher = usersRepository.findById(teacherId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid teacher ID"
            )
        if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User with ID $teacherId is not a teacher nor a coordinator"
            )
        }
        if (groupsRepository.existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(teacher, weekday, startTimeWithSeconds, endTimeWithSeconds, edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Teacher is already teaching a group at this time"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddGroupWithUsersPermission(arguments: JsonNode): Permission {
        val action = "addGroupWithUsers"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add groups"
            )
        }

//        @InputArgument editionId: Long, @InputArgument usosId: Int,
//        @InputArgument weekdayId: Long, @InputArgument startTime: Time,
//        @InputArgument endTime: Time, @InputArgument teacherId: Long, @InputArgument label: String = "",
//        @InputArgument groupName: String = "", @InputArgument users: List<UsersInputType>

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val usosId = arguments.getIntField("usosId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'usosId'"
        )

        val weekdayId = arguments.getLongField("weekdayId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'weekdayId'"
        )

        val startTime = arguments.getStringField("startTime") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'startTime'"
        )

        val endTime = arguments.getStringField("endTime") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'endTime'"
        )

        val teacherId = arguments.getLongField("teacherId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'teacherId'"
        )

        val groupName = arguments.getStringField("groupName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'groupName'"
        )

        val users = arguments.getUsersInputTypeList("users") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'users'"
        )

        val hh_mm = Regex("([01]?[0-9]|2[0-3]):[0-5][0-9]")
        if (!hh_mm.matches(startTime) || !hh_mm.matches(endTime)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid time format, must be HH:MM"
            )
        }

        val startTimeWithSeconds = Time.valueOf("$startTime:00")
        val endTimeWithSeconds = Time.valueOf("$endTime:00")


        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )
        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }
        if (edition.levelSet == null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Cannot add a group to an edition without levels"
            )
        }
        if (groupsRepository.existsByUsosIdAndEdition(usosId.toLong(), edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Group with USOS ID $usosId already exists for edition ${edition.editionId}"
            )
        }
        if (groupsRepository.findAllByGroupNameAndEdition(groupName, edition).any { it.groupName?.isNotBlank() == true }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Group with name $groupName already exists for edition ${edition.editionId}"
            )
        }
        if (startTimeWithSeconds.after(endTimeWithSeconds)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Start time must be before end time"
            )
        }
        if (startTimeWithSeconds == endTimeWithSeconds) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Start time must be different from end time"
            )
        }
        val weekday = weekdaysRepository.findById(weekdayId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid weekday ID"
            )
        val teacher = usersRepository.findById(teacherId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid teacher ID"
            )
        if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User with ID $teacherId is not a teacher nor a coordinator"
            )
        }
        if (groupsRepository.existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(teacher, weekday, startTimeWithSeconds, endTimeWithSeconds, edition)) {
            throw IllegalArgumentException("Teacher is already teaching a group at this time")
        }

        photoAssigner.checkAssignPhotoToAssigneePermission(groupsRepository, "image/group", null, null)

        users.forEach {
            if (!usersRepository.existsByIndexNumber(it.indexNumber)) {
                val permission = usersPermissions.checkAddUserHelperPermission(
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
                if (!permission.allow) {
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = permission.reason
                    )
                }
            } else {
                usersRepository.findByIndexNumber(it.indexNumber)
                    ?: return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "User with index number ${it.indexNumber} not found"
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

    fun checkEditGroupPermission(arguments: JsonNode): Permission {
        val action = "editGroup"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            throw IllegalArgumentException("Only teachers and coordinators can edit groups")
        }

        val groupId = arguments.getLongField("groupId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'groupId'"
        )

        val groupName = arguments.getStringField("groupName")

        val usosId = arguments.getIntField("usosId")

        val weekdayId = arguments.getLongField("weekdayId")

        val startTime = arguments.getStringField("startTime")

        val endTime = arguments.getStringField("endTime")

        val teacherId = arguments.getLongField("teacherId")

        val hh_mm = Regex("([01]?[0-9]|2[0-3]):[0-5][0-9]")


        val group = groupsRepository.findById(groupId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid group ID"
            )

        if (currentUser.role == UsersRoles.TEACHER){
            if (group.teacher.userId != currentUser.userId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only edit their groups"
                )
            }
            if (usosId != null || weekdayId != null || startTime != null || endTime != null || teacherId != null){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only edit groupName and label"
                )
            }
        }

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        groupName?.let {
            if (it != "" && groupsRepository.existsByGroupNameAndEdition(it, group.edition) && it != group.groupName) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Group with name $it already exists for edition ${group.edition.editionId}"
                )
            }
            group.groupName = it
        }

        usosId?.let {
            if (groupsRepository.existsByUsosIdAndEdition(it.toLong(), group.edition) && it != group.usosId) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Group with USOS ID $it already exists for edition ${group.edition.editionId}"
                )
            }
            group.usosId = it
        }

        weekdayId?.let {
            val weekday = weekdaysRepository.findById(it).orElse(null)
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid weekday ID"
                )
            group.weekday = weekday
        }

        startTime?.let {

            if (!hh_mm.matches(startTime)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid time format, must be HH:MM"
                )
            }

            val startTimeWithSeconds = Time.valueOf("$startTime:00")

            if (endTime != null && startTimeWithSeconds.after(Time.valueOf("$endTime:00"))) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Start time must be before end time"
                )
            }
            if (endTime != null && startTimeWithSeconds == Time.valueOf("$endTime:00")) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Start time must be different from end time"
                )
            }
            if (endTime == null && startTimeWithSeconds.after(group.endTime)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Start time must be before end time"
                )
            }
            group.startTime = startTimeWithSeconds
        }

        endTime?.let {
            if (!hh_mm.matches(endTime)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid time format, must be HH:MM"
                )
            }

            val endTimeWithSeconds = Time.valueOf("$endTime:00")

            if (startTime != null && Time.valueOf("$startTime:00").after(endTimeWithSeconds)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "End time must be after start time"
                )
            }
            if (startTime != null && Time.valueOf("$startTime:00") == endTimeWithSeconds) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "End time must be different from start time"
                )
            }
            if (startTime == null && group.startTime.after(endTimeWithSeconds)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "End time must be after start time"
                )
            }
            group.endTime = endTimeWithSeconds
        }

        teacherId?.let {
            val teacher = usersRepository.findById(it).orElse(null)
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid teacher ID"
                )
            if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "User with ID $it is not a teacher nor a coordinator"
                )
            }
            if (groupsRepository.existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(
                    teacher, group.weekday, group.startTime, group.endTime, group.edition
                ) && it != group.teacher.userId
            ) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher is already teaching a group at this time"
                )
            }
            group.teacher = teacher
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }


    fun checkEditGroupWithUsersPermission(arguments: JsonNode): Permission {
        val action = "editGroupWithUsers"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can edit groups"
            )
        }


        val groupId = arguments.getLongField("groupId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'groupId'"
        )

        val groupName = arguments.getStringField("groupName")

        val usosId = arguments.getIntField("usosId")

        val weekdayId = arguments.getLongField("weekdayId")

        val startTime = arguments.getStringField("startTime")

        val endTime = arguments.getStringField("endTime")

        val teacherId = arguments.getLongField("teacherId")

        val hh_mm = Regex("([01]?[0-9]|2[0-3]):[0-5][0-9]")

        val users = arguments.getUserIdsType("users") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'users'"
        )

        val group = groupsRepository.findById(groupId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid group ID"
            )

        if (currentUser.role == UsersRoles.TEACHER){
            if (group.teacher.userId != currentUser.userId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only edit their groups"
                )
            }
            if (usosId != null || weekdayId != null || startTime != null || endTime != null || teacherId != null){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only edit groupName and label"
                )
            }
        }

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        groupName?.let {
            if (it != "" && groupsRepository.existsByGroupNameAndEdition(it, group.edition) && it != group.groupName) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Group with name $it already exists for edition ${group.edition.editionId}"
                )
            }
            group.groupName = it
        }

        usosId?.let {
            if (groupsRepository.existsByUsosIdAndEdition(it.toLong(), group.edition) && it != group.usosId) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Group with USOS ID $it already exists for edition ${group.edition.editionId}"
                )
            }
            group.usosId = it
        }

        weekdayId?.let {
            val weekday = weekdaysRepository.findById(it).orElse(null)
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid weekday ID"
                )
            group.weekday = weekday
        }

        startTime?.let {

            if (!hh_mm.matches(startTime)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid time format, must be HH:MM"
                )
            }

            val startTimeWithSeconds = Time.valueOf("$startTime:00")

            if (endTime != null && startTimeWithSeconds.after(Time.valueOf("$endTime:00"))) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Start time must be before end time"
                )
            }
            if (endTime != null && startTimeWithSeconds == Time.valueOf("$endTime:00")) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Start time must be different from end time"
                )
            }
            if (endTime == null && startTimeWithSeconds.after(group.endTime)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Start time must be before end time"
                )
            }
            group.startTime = startTimeWithSeconds
        }

        endTime?.let {
            if (!hh_mm.matches(endTime)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid time format, must be HH:MM"
                )
            }

            val endTimeWithSeconds = Time.valueOf("$endTime:00")

            if (startTime != null && Time.valueOf("$startTime:00").after(endTimeWithSeconds)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "End time must be after start time"
                )
            }
            if (startTime != null && Time.valueOf("$startTime:00") == endTimeWithSeconds) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "End time must be different from start time"
                )
            }
            if (startTime == null && group.startTime.after(endTimeWithSeconds)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "End time must be after start time"
                )
            }
            group.endTime = endTimeWithSeconds
        }

        teacherId?.let {
            val teacher = usersRepository.findById(it).orElse(null)
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid teacher ID"
                )
            if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "User with ID $it is not a teacher nor a coordinator"
                )
            }
            if (groupsRepository.existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(
                    teacher, group.weekday, group.startTime, group.endTime, group.edition
                ) && it != group.teacher.userId
            ) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher is already teaching a group at this time"
                )
            }
            group.teacher = teacher
        }


        val existingUsers = usersRepository.findByUserGroups_Group_GroupsId(groupId)
        val inputUserIds = users.userIds.toSet()

        if (users.userIds.toSet().size != users.userIds.size){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User IDs must be unique"
            )
        }

        // Remove userGroups not in input list
        existingUsers.filter { it.userId !in inputUserIds }.filter { it.role == UsersRoles.STUDENT }
            .forEach { userGroupsRepository.deleteByUserAndGroup(it, group) }

        // users that are not in the group yet
        users.userIds.filter { userId -> userId !in existingUsers.map { it.userId } }
            .forEach { userId ->
                val user = usersRepository.findById(userId).getOrNull()
                    ?: return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "Invalid User ID: $userId"
                    )
                if (user.role != UsersRoles.STUDENT) {
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "User with ID $userId is not a student"
                    )
                }

                if (userGroupsRepository.existsByUserAndGroup(user, group)){
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "This User already exists in this Group"
                    )
                }

                if (userGroupsRepository.existsByUserAndGroup_Edition(user, group.edition)){
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "This User already exists in a group in this Edition"
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
    fun checkRemoveGroupPermission(arguments: JsonNode): Permission {
        val action = "removeGroup"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove groups"
            )
        }

        val groupId = arguments.getLongField("groupId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'groupId'"
        )

        val group = groupsRepository.findById(groupId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid group ID"
            )

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
    fun checkGetPossibleGroupsWeekdaysPermission(arguments: JsonNode): Permission {
        val action = "getPossibleGroupsWeekdays"
        val currentUser = userMapper.getCurrentUser()

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        if (currentUser.role != UsersRoles.COORDINATOR) {
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == editionId }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "User is not in edition with ID $editionId"
                )
            }
        }
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

    fun checkGetPossibleGroupsTimeSpansPermission(arguments: JsonNode): Permission {
        val action = "getPossibleGroupsTimeSpans"
        val currentUser = userMapper.getCurrentUser()


        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        if (currentUser.role != UsersRoles.COORDINATOR) {
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == editionId }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "User is not in edition with ID $editionId"
                )
            }
        }
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

    fun checkGetPossibleGroupDatesPermission(arguments: JsonNode): Permission {
        val action = "getPossibleGroupDates"
        val currentUser = userMapper.getCurrentUser()

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        if (currentUser.role != UsersRoles.COORDINATOR) {
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == editionId }) {
                throw IllegalArgumentException("User is not in edition with ID $editionId")
            }
        }
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

    fun checkGetUsersInGroupWithPointsPermission(arguments: JsonNode): Permission {
        val action = "getUsersInGroupWithPoints"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            throw IllegalArgumentException("Student cannot view users in groups")
        }

        val groupId = arguments.getLongField("groupId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'groupId'"
        )

        if (currentUser.role == UsersRoles.TEACHER){
            val groupEdition = groupsRepository.findById(groupId).orElseThrow { IllegalArgumentException("Invalid group ID") }.edition
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == groupEdition.editionId }) {
                throw IllegalArgumentException("User is not in edition with ID ${groupEdition.editionId}")
            }
        }

        val group = groupsRepository.findById(groupId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid group ID"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkGetGroupsInEditionPermission(arguments: JsonNode): Permission {
        val action = "getGroupsInEdition"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            throw IllegalArgumentException("Student cannot view groups")
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        if (currentUser.role == UsersRoles.TEACHER){
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == editionId }) {
                throw IllegalArgumentException("User is not in edition with ID $editionId")
            }
        }

        val teacherId = arguments.getLongField("teacherId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'teacherId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )
        val teacher = usersRepository.findById(teacherId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid teacher ID"
            )
        if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User with ID $teacherId is not a teacher nor a coordinator"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveGroupHelperPermission(groupId: Long): Permission {
        val action = "removeGroupHelper"
        val arguments = objectMapper.valueToTree<JsonNode>(
            mapOf(
                "groupId" to groupId
            )
        )
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove groups"
            )
        }

        val group = groupsRepository.findById(groupId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid group ID"
            )

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}