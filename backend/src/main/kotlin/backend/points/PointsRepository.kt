package backend.points

import backend.edition.Edition
import backend.groups.Groups
import backend.subcategories.Subcategories
import backend.users.Users
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface PointsRepository : JpaRepository<Points, Long> {
    fun findByStudentAndSubcategory(studentId: Users, subcategoryId: Subcategories) : List<Points>
    fun findAllByStudentAndSubcategory_Edition(student: Users, edition: Edition): List<Points>
    fun findAllByStudent(student: Users): List<Points>
    fun findAllByStudentAndSubcategory_SubcategoryId(student: Users, subcategoryId: Long): List<Points>
    fun findByStudent_UserIdIn(userIds: Collection<Long>): List<Points>
    fun findByStudent_UserId(userId: Long): List<Points>
    fun findBySubcategoryAndStudent_UserGroups_Group(subcategory: Subcategories, group: Groups): List<Points>
    fun findBySubcategory(subcategory: Subcategories): List<Points>
}
