package backend.groups

import backend.edition.Edition
import backend.users.Users
import backend.weekdays.Weekdays
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.sql.Time

@Repository
interface GroupsRepository : JpaRepository<Groups, Long> {
    fun findByGroupNameAndEdition(groupName: String, edition: Edition): Groups
    fun findAllByGroupNameAndEdition(groupName: String, edition: Edition): List<Groups>
    fun findByEdition(edition: Edition): List<Groups>
    fun findByUserGroups_User_UserId(userId: Long): List<Groups>
    fun existsByGroupNameAndEdition(groupName: String, edition: Edition): Boolean
    fun existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(teacher: Users, weekday: Weekdays, startTime: Time, endTime: Time, edition: Edition): Boolean
    fun findByUsosIdAndEdition(usosId: Long, edition: Edition): Groups?
    fun existsByUsosIdAndEdition(usosId: Long, edition: Edition): Boolean
    fun findByTeacher_UserId(userId: Long): List<Groups>
    fun existsByEdition(edition: Edition): Boolean
}
