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
import backend.utils.JsonNodeExtensions.getUserIdsType
import backend.utils.JsonNodeExtensions.getUsersInputTypeList
import backend.utils.UserMapper
import backend.weekdays.WeekdaysRepository
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
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
                reason = "Tylko koordynatorzy mogą wylistować grupy do setupu"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
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
                reason = "Tylko koordynatorzy mogą przypisywać zdjęcia do grup"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )

        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }
        val groups = groupsRepository.findByEdition(edition)

        val photosForGroups = fileEntityRepository.findAllByFileType("image/group")

        if (groups.size > photosForGroups.size) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie wystarczająca ilość zdjęć do przypisania do wszystkich grup. Brakuje ${groups.size - photosForGroups.size} zdjęć." +
                        " Proszę dodać więcej zdjęć z fileType = image/group i spróbować ponownie."
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
                reason = "Tylko koordynatorzy mogą dodawać grupy"
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
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val usosId = arguments.getIntField("usosId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'usosId'"
        )

        val weekdayId = arguments.getLongField("weekdayId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'weekdayId'"
        )

        val startTime = arguments.getStringField("startTime") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'startTime'"
        )

        val endTime = arguments.getStringField("endTime") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'endTime'"
        )

        val teacherId = arguments.getLongField("teacherId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'teacherId'"
        )

        val groupName = arguments.getStringField("groupName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'groupName'"
        )

        val hh_mm = Regex("([01]?[0-9]|2[0-3]):[0-5][0-9]")
        if (!hh_mm.matches(startTime) || !hh_mm.matches(endTime)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nieprawidłowy format czasu, musi być HH:MM"
            )
        }

        val startTimeWithSeconds = Time.valueOf("$startTime:00")
        val endTimeWithSeconds = Time.valueOf("$endTime:00")


        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )
        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }
        if (edition.levelSet == null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie można dodać grupy do edycji bez poziomów"
            )
        }
        if (groupsRepository.existsByUsosIdAndEdition(usosId.toLong(), edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Grupa z USOS ID $usosId już istnieje dla edycji ${edition.editionId}"
            )
        }
        if (groupsRepository.findAllByGroupNameAndEdition(groupName, edition).any { it.groupName?.isNotBlank() == true }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Grupa o nazwie $groupName już istnieje dla edycji ${edition.editionId}"
            )
        }
        if (startTimeWithSeconds.after(endTimeWithSeconds)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Czas rozpoczęcia musi być przed czasem zakończenia"
            )
        }
        if (startTimeWithSeconds == endTimeWithSeconds) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Czas rozpoczęcia musi być różny od czasu zakończenia"
            )
        }
        val weekday = weekdaysRepository.findById(weekdayId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono dnia tygodnia o id $weekdayId"
            )
        val teacher = usersRepository.findById(teacherId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono nauczyciela o id $teacherId"
            )
        if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik o id $teacherId nie jest prowadzącym ani koordynatorem"
            )
        }
        if (groupsRepository.existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(teacher, weekday, startTimeWithSeconds, endTimeWithSeconds, edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Prowadzący już prowadzi grupę w tym czasie"
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
                reason = "Tylko koordynatorzy mogą dodawać grupy"
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
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val usosId = arguments.getIntField("usosId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'usosId'"
        )

        val weekdayId = arguments.getLongField("weekdayId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'weekdayId'"
        )

        val startTime = arguments.getStringField("startTime") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'startTime'"
        )

        val endTime = arguments.getStringField("endTime") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'endTime'"
        )

        val teacherId = arguments.getLongField("teacherId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'teacherId'"
        )

        val groupName = arguments.getStringField("groupName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'groupName'"
        )

        val users = arguments.getUsersInputTypeList("users") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'users'"
        )

        val hh_mm = Regex("([01]?[0-9]|2[0-3]):[0-5][0-9]")
        if (!hh_mm.matches(startTime) || !hh_mm.matches(endTime)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nieprawidłowy format czasu, musi być HH:MM"
            )
        }

        val startTimeWithSeconds = Time.valueOf("$startTime:00")
        val endTimeWithSeconds = Time.valueOf("$endTime:00")


        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )
        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }
        if (edition.levelSet == null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie można dodać grupy do edycji bez poziomów"
            )
        }
        if (groupsRepository.existsByUsosIdAndEdition(usosId.toLong(), edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Grupa z USOS ID $usosId już istnieje dla edycji ${edition.editionId}"
            )
        }
        if (groupsRepository.findAllByGroupNameAndEdition(groupName, edition).any { it.groupName?.isNotBlank() == true }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Grupa o nazwie $groupName już istnieje dla edycji ${edition.editionId}"
            )
        }
        if (startTimeWithSeconds.after(endTimeWithSeconds)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Czas rozpoczęcia musi być przed czasem zakończenia"
            )
        }
        if (startTimeWithSeconds == endTimeWithSeconds) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Czas rozpoczęcia musi być różny od czasu zakończenia"
            )
        }
        val weekday = weekdaysRepository.findById(weekdayId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono dnia tygodnia o id $weekdayId"
            )
        val teacher = usersRepository.findById(teacherId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono nauczyciela o id $teacherId"
            )
        if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik o id $teacherId nie jest nauczycielem ani koordynatorem"
            )
        }
        if (groupsRepository.existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(teacher, weekday, startTimeWithSeconds, endTimeWithSeconds, edition)) {
            throw IllegalArgumentException("Prowadzący już prowadzi grupę w tym czasie")
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
                        reason = "Nie znaleziono użytkownika o numerze indeksu ${it.indexNumber}"
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
            throw IllegalArgumentException("Tylko nauczyciele i koordynatorzy mogą edytować grupy")
        }

        val groupId = arguments.getLongField("groupId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'groupId'"
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
                reason = "Nie znaleziono grupy o id $groupId"
            )

        if (currentUser.role == UsersRoles.TEACHER){
            if (group.teacher.userId != currentUser.userId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący może edytować tylko swoje grupy"
                )
            }
            if (usosId != null || weekdayId != null || startTime != null || endTime != null || teacherId != null){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący może edytować tylko nazwę grupy i label"
                )
            }
        }

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }

        groupName?.let {
            if (it != "" && groupsRepository.existsByGroupNameAndEdition(it, group.edition) && it != group.groupName) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Grupa o nazwie $it już istnieje dla edycji ${group.edition.editionId}"
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
                    reason = "Grupa z USOS ID $it już istnieje dla edycji ${group.edition.editionId}"
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
                    reason = "Nie znaleziono dnia tygodnia o id $weekdayId"
                )
            group.weekday = weekday
        }

        startTime?.let {

            if (!hh_mm.matches(startTime)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nieprawidłowy format czasu, musi być HH:MM"
                )
            }

            val startTimeWithSeconds = Time.valueOf("$startTime:00")

            if (endTime != null && startTimeWithSeconds.after(Time.valueOf("$endTime:00"))) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Czas rozpoczęcia musi być przed czasem zakończenia"
                )
            }
            if (endTime != null && startTimeWithSeconds == Time.valueOf("$endTime:00")) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Czas rozpoczęcia musi być różny od czasu zakończenia"
                )
            }
            if (endTime == null && startTimeWithSeconds.after(group.endTime)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Czas rozpoczęcia musi być przed czasem zakończenia"
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
                    reason = "Nieprawidłowy format czasu, musi być HH:MM"
                )
            }

            val endTimeWithSeconds = Time.valueOf("$endTime:00")

            if (startTime != null && Time.valueOf("$startTime:00").after(endTimeWithSeconds)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Czas zakończenia musi być po czasie rozpoczęcia"
                )
            }
            if (startTime != null && Time.valueOf("$startTime:00") == endTimeWithSeconds) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Czas zakończenia musi być różny od czasu rozpoczęcia"
                )
            }
            if (startTime == null && group.startTime.after(endTimeWithSeconds)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Czas zakończenia musi być po czasie rozpoczęcia"
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
                    reason = "Nie znaleziono nauczyciela o id $teacherId"
                )
            if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Użytkownik o id $teacherId nie jest nauczycielem ani koordynatorem"
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
                    reason = "Prowadzący już prowadzi grupę w tym czasie"
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
                reason = "Tylko nauczyciele i koordynatorzy mogą edytować grupy"
            )
        }


        val groupId = arguments.getLongField("groupId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'groupId'"
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
            reason = "Nieprawidłowe lub brakujące 'users'"
        )

        val group = groupsRepository.findById(groupId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono grupy o id $groupId"
            )

        if (currentUser.role == UsersRoles.TEACHER){
            if (group.teacher.userId != currentUser.userId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący może edytować tylko swoje grupy"
                )
            }
            if (usosId != null || weekdayId != null || startTime != null || endTime != null || teacherId != null){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący może edytować tylko nazwę grupy i label"
                )
            }
        }

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }

        groupName?.let {
            if (it != "" && groupsRepository.existsByGroupNameAndEdition(it, group.edition) && it != group.groupName) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Grupa o nazwie $it już istnieje dla edycji ${group.edition.editionId}"
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
                    reason = "Grupa z USOS ID $it już istnieje dla edycji ${group.edition.editionId}"
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
                    reason = "Nie znaleziono dnia tygodnia o id $weekdayId"
                )
            group.weekday = weekday
        }

        startTime?.let {

            if (!hh_mm.matches(startTime)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nieprawidłowy format czasu, musi być HH:MM"
                )
            }

            val startTimeWithSeconds = Time.valueOf("$startTime:00")

            if (endTime != null && startTimeWithSeconds.after(Time.valueOf("$endTime:00"))) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Czas rozpoczęcia musi być przed czasem zakończenia"
                )
            }
            if (endTime != null && startTimeWithSeconds == Time.valueOf("$endTime:00")) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Czas rozpoczęcia musi być różny od czasu zakończenia"
                )
            }
            if (endTime == null && startTimeWithSeconds.after(group.endTime)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Czas rozpoczęcia musi być przed czasem zakończenia"
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
                    reason = "Nieprawidłowy format czasu, musi być HH:MM"
                )
            }

            val endTimeWithSeconds = Time.valueOf("$endTime:00")

            if (startTime != null && Time.valueOf("$startTime:00").after(endTimeWithSeconds)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Czas zakończenia musi być po czasie rozpoczęcia"
                )
            }
            if (startTime != null && Time.valueOf("$startTime:00") == endTimeWithSeconds) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Czas zakończenia musi być różny od czasu rozpoczęcia"
                )
            }
            if (startTime == null && group.startTime.after(endTimeWithSeconds)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Czas zakończenia musi być po czasie rozpoczęcia"
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
                    reason = "Nie znaleziono nauczyciela o id $teacherId"
                )
            if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Użytkownik o id $teacherId nie jest nauczycielem ani koordynatorem"
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
                    reason = "Prowadzący już prowadzi grupę w tym czasie"
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
                reason = "Identyfikatory użytkowników muszą być unikalne"
            )
        }

        // Remove userGroups not in input list
        existingUsers.filter { it.userId !in inputUserIds }.filter { it.role == UsersRoles.STUDENT }
            .forEach { userGroupsRepository.deleteByUserAndGroup(it, group) }

        // users that are not in the group yet
        val permissionMsg = StringBuilder()
        users.userIds.filter { userId -> userId !in existingUsers.map { it.userId } }
            .forEach { userId ->
                val user = usersRepository.findById(userId).getOrNull()
                if (user == null) {
                    permissionMsg.append("Użytkownik o ID $userId nie istnieje;\n")
                    return@forEach
                }
                if (user.role != UsersRoles.STUDENT) {
                    permissionMsg.append("Użytkownik ${user.firstName} ${user.secondName} nie jest studentem;\n")
                    return@forEach
                }

                if (userGroupsRepository.existsByUserAndGroup(user, group)){
                    permissionMsg.append("Użytkownik ${user.firstName} ${user.secondName} już istnieje w tej grupie;\n")
                    return@forEach
                }

                if (userGroupsRepository.existsByUserAndGroup_Edition(user, group.edition)){
                    permissionMsg.append("Użytkownik ${user.firstName} ${user.secondName} jest już w grupie w tej edycji;\n")
                    return@forEach
                }
            }

        if (permissionMsg.isNotEmpty()){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = permissionMsg.toString()
            )
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
                reason = "Tylko koordynatorzy mogą usuwać grupy"
            )
        }

        val groupId = arguments.getLongField("groupId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'groupId'"
        )

        val group = groupsRepository.findById(groupId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono grupy o id $groupId"
            )

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }
        if (group.userGroups.any { userGroup -> userGroup.user.points.isNotEmpty()}){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie można usunąć grupy z użytkownikami, którzy mają przyznane punkty"
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
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        if (currentUser.role != UsersRoles.COORDINATOR) {
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == editionId }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Użytkownik nie jest w edycji o id $editionId"
                )
            }
        }
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
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
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        if (currentUser.role != UsersRoles.COORDINATOR) {
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == editionId }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Użytkownik nie jest w edycji o id $editionId"
                )
            }
        }
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
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
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        if (currentUser.role != UsersRoles.COORDINATOR) {
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == editionId }) {
                throw IllegalArgumentException("Użytkownik nie jest w edycji o id $editionId")
            }
        }
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
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
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko prowadzący i koordynatorzy mogą przeglądać użytkowników w grupach"
            )
        }

        val groupId = arguments.getLongField("groupId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'groupId'"
        )

        if (currentUser.role == UsersRoles.TEACHER){
            val groupEdition = groupsRepository.findById(groupId).orElseThrow { IllegalArgumentException("Nie znaleziono grupy o id $groupId") }.edition
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == groupEdition.editionId }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Użytkownik nie jest w edycji o id ${groupEdition.editionId}"
                )
            }
        }

        val group = groupsRepository.findById(groupId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono grupy o id $groupId"
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
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko prowadzący i koordynatorzy mogą przeglądać grupy"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        if (currentUser.role == UsersRoles.TEACHER){
            val userEditions = groupsRepository.findByUserGroups_User_UserId(currentUser.userId).map { it.edition }
            if (userEditions.none { it.editionId == editionId }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Użytkownik nie jest w edycji o id $editionId"
                )
            }
        }

        val teacherId = arguments.getLongField("teacherId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'teacherId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )
        val teacher = usersRepository.findById(teacherId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono nauczyciela o id $teacherId"
            )
        if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik o id $teacherId nie jest nauczycielem ani koordynatorem"
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
                reason = "Tylko koordynatorzy mogą usuwać grupy"
            )
        }

        val group = groupsRepository.findById(groupId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono grupy o id $groupId"
            )

        if (group.edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }

        if (group.userGroups.any { userGroup -> userGroup.user.points.isNotEmpty()}){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie można usunąć grupy z użytkownikami, którzy mają przyznane punkty"
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