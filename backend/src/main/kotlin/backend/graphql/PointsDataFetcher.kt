package backend.graphql

import backend.points.Points
import backend.points.PointsRepository
import backend.bonuses.BonusesRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.award.AwardType
import backend.groups.GroupsRepository
import backend.users.Users
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode

@DgsComponent
class PointsDataFetcher {
    @Autowired
    private lateinit var groupsRepository: GroupsRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    lateinit var pointsRepository: PointsRepository

    @Autowired
    lateinit var bonusRepository: BonusesRepository

    @Autowired
    lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    lateinit var usersRepository: UsersRepository

    @DgsMutation
    @Transactional
    fun addPoints(@InputArgument studentId: Long, @InputArgument teacherId: Long, @InputArgument value: Float,
                          @InputArgument subcategoryId: Long, @InputArgument checkDates: Boolean = true): Points {
        return addPointsHelper(studentId, teacherId, value, subcategoryId, checkDates)
    }

    @DgsMutation
    @Transactional
    fun editPoints(
        @InputArgument pointsId: Long,
        @InputArgument value: Float?
    ): Points {
        return editPointsHelper(pointsId, value)
    }

    @DgsMutation
    @Transactional
    fun removePoints(@InputArgument pointsId: Long): Boolean {
        return removePointsHelper(pointsId)
    }

    @DgsMutation
    @Transactional
    fun addPointsToGroup(@InputArgument groupId: Long,
                         @InputArgument teacherId: Long,
                         @InputArgument values: List<GroupPointsInput>,
                          @InputArgument subcategoryId: Long,
                         @InputArgument checkDates: Boolean = true): List<GroupPoints> {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)) {
            throw IllegalArgumentException("Only teachers and coordinators can add points")
        }

        val group = groupsRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Invalid group ID") }

        val studentsInGroup = group.userGroups.map { it.user }
            .filter { it.role == UsersRoles.STUDENT }

        val teacher = usersRepository.findByUserId(teacherId)
            .orElseThrow { IllegalArgumentException("Invalid teacher ID") }

        val subcategory = subcategoriesRepository.findById(subcategoryId)
            .orElseThrow { IllegalArgumentException("Invalid subcategory ID") }

        if (values.map { it.studentId }.toSet() != studentsInGroup.map{it.userId}.toSet()) {
            throw IllegalArgumentException("Students in the group and in the input do not match")
        }

        val oldPoints = pointsRepository.findBySubcategoryAndStudent_UserGroups_Group(subcategory, group)
            .filter { bonusRepository.findByPoints(it).isEmpty() }.associate { it.student.userId to it.value }

        val allOldPoints = studentsInGroup.associate { it.userId to oldPoints.getOrDefault(it.userId, null) }

        val newPoints = values.associate { it.studentId to it.value }

        val pointsNotChanged = studentsInGroup.filter { student -> allOldPoints[student.userId]?.toFloat() == newPoints[student.userId] }
            .map { student -> GroupPointsInput(student.userId, newPoints[student.userId]) }
        val pointsToAdd = studentsInGroup.filter { student -> allOldPoints[student.userId] == null && newPoints[student.userId] != null }
            .map { student -> GroupPointsInput(student.userId, newPoints[student.userId]) }
        val pointsToRemove = studentsInGroup.filter { student -> allOldPoints[student.userId] != null && newPoints[student.userId] == null }
            .map { student -> GroupPointsInput(student.userId, null) }
        val pointsToEdit = studentsInGroup.filter { student -> allOldPoints[student.userId] != null && newPoints[student.userId] != null  && allOldPoints[student.userId]?.toFloat() != newPoints[student.userId] }
            .map { student -> GroupPointsInput(student.userId, newPoints[student.userId])}


        val resultedPoints = mutableListOf<GroupPoints>()
        pointsNotChanged.forEach { point ->
            val student = usersRepository.findByUserId(point.studentId)
                .orElseThrow { IllegalArgumentException("Invalid user ID") }
            val studentPoints = pointsRepository.findByStudentAndSubcategory(student, subcategory)
                .filter { bonusRepository.findByPoints(it).isEmpty() }
            if (studentPoints.isNotEmpty()) {
                resultedPoints.add(GroupPoints(student, studentPoints[0]))
            } else {
                resultedPoints.add(GroupPoints(student, null))
            }
        }
        pointsToAdd.forEach { point ->
            val student = usersRepository.findByUserId(point.studentId)
                .orElseThrow { IllegalArgumentException("Invalid user ID") }
            val studentPoints = addPointsHelper(point.studentId, teacherId, point.value!!, subcategoryId, checkDates)
            resultedPoints.add(GroupPoints(student, studentPoints))
        }
        pointsToRemove.forEach { point ->
            val student = usersRepository.findByUserId(point.studentId)
                .orElseThrow { IllegalArgumentException("Invalid user ID") }
            val studentPoints = pointsRepository.findByStudentAndSubcategory(student, subcategory)
                .filter { bonusRepository.findByPoints(it).isEmpty() }
            if (studentPoints.isNotEmpty()) {
                removePointsHelper(studentPoints[0].pointsId)
            }
            resultedPoints.add(GroupPoints(student, null))
        }
        pointsToEdit.forEach { point ->
            val student = usersRepository.findByUserId(point.studentId)
                .orElseThrow { IllegalArgumentException("Invalid user ID") }
            val studentPoints = pointsRepository.findByStudentAndSubcategory(student, subcategory)
                .filter { bonusRepository.findByPoints(it).isEmpty() }
            if (studentPoints.isEmpty()) {
                throw IllegalArgumentException("Error while editing points - student has no points in this subcategory")
            }
            val editedPoints = editPointsHelper(studentPoints[0].pointsId, point.value)

            resultedPoints.add(GroupPoints(student, editedPoints))
        }

        return resultedPoints
    }

    private fun addPointsHelper(studentId: Long, teacherId: Long, value: Float,
                                subcategoryId: Long, checkDates: Boolean = true): Points {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            throw IllegalArgumentException("Only teachers and coordinators can add points")
        }

        val student = usersRepository.findByUserId(studentId)
            .orElseThrow { IllegalArgumentException("Invalid user ID") }

        if (currentUser.role == UsersRoles.TEACHER){
            if (teacherId != currentUser.userId){
                throw IllegalArgumentException("Teacher can only add points as themselves")
            }
            val studentTeachers = student.userGroups.map { it.group.teacher }.distinct()
            if (!studentTeachers.contains(currentUser)){
                throw IllegalArgumentException("Teacher can only add points to students from their groups")
            }
        }

        val teacher = usersRepository.findByUserId(teacherId)
            .orElseThrow { IllegalArgumentException("Invalid user ID") }

        val subcategory = subcategoriesRepository.findById(subcategoryId)
            .orElseThrow { IllegalArgumentException("Invalid subcategory ID") }
        if (subcategory.edition == null){
            throw IllegalArgumentException("Subcategory has no edition")
        }

        if (checkDates){
            if (subcategory.edition?.startDate?.isAfter(java.time.LocalDate.now()) == true){
                throw IllegalArgumentException("Subcategory's edition has not started yet")
            }
            if (subcategory.edition?.endDate?.isBefore(java.time.LocalDate.now()) == true){
                throw IllegalArgumentException("Subcategory's edition has already ended")
            }
        }
        if (!subcategory.category.canAddPoints) {
            throw IllegalArgumentException("This subcategory's category does not allow adding points")
        }

        if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Points can be added only by teacher or coordinator")
        }
        if (student.role != UsersRoles.STUDENT) {
            throw IllegalArgumentException("Points can be added only to student")
        }

        if (teacher.role == UsersRoles.TEACHER && student.userGroups.none { it.group.teacher == teacher }) {
            throw IllegalArgumentException("Teacher is not a teacher of student's group")
        }

        val studentEditions = student.userGroups.map { it.group.edition }.distinct()
        if (!studentEditions.contains(subcategory.edition)) {
            throw IllegalArgumentException("Student is not participating in subcategory edition")
        }
        val teacherEditions = teacher.userGroups.map { it.group.edition }.distinct()
        if (!teacherEditions.contains(subcategory.edition)) {
            throw IllegalArgumentException("Teacher is not participating in subcategory edition")
        }
        if (value < 0) {
            throw IllegalArgumentException("Value cannot be negative")
        }
        val studentPoints = student.getPointsBySubcategory(subcategoryId, pointsRepository)
        val studentPointsWithoutBonuses = studentPoints.filter { bonusRepository.findByPoints(it).isEmpty() }
        if (studentPointsWithoutBonuses.isNotEmpty()) {
            throw IllegalArgumentException("This student already has points in this subcategory")
        }

        val points = Points(
            student = student,
            teacher = teacher,
            updatedBy = currentUser,
            value = BigDecimal(value.toString()).setScale(2, RoundingMode.HALF_UP),
            subcategory = subcategory,
            label = ""
        )
        val savedPoints = pointsRepository.save(points)


        val bonusesMultiplicative = bonusRepository.findByAward_AwardTypeAndPoints_Student(AwardType.MULTIPLICATIVE, points.student)
            .filter { bonus -> bonus.points.subcategory.edition == points.subcategory.edition }
            .filter { bonus -> bonus.points.subcategory.category == points.subcategory.category }

        val bonusesAdditivePrev = bonusRepository.findByAward_AwardTypeAndPoints_Student(AwardType.ADDITIVE_PREV, points.student)
            .filter { bonus -> bonus.points.subcategory.edition == points.subcategory.edition }
            .filter { bonus -> bonus.points.subcategory.category == points.subcategory.category }

        bonusesMultiplicative.forEach { bonus ->
            bonus.updateMultiplicativePoints(bonusRepository, pointsRepository)
        }
        bonusesAdditivePrev.forEach { bonus ->
            bonus.updateAdditivePrevPoints(bonusRepository, pointsRepository)
        }

        return savedPoints
    }

    private fun editPointsHelper(pointsId: Long, value: Float?) : Points {
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            throw IllegalArgumentException("Only teachers and coordinators can edit points")
        }

        val points = pointsRepository.findById(pointsId)
            .orElseThrow { IllegalArgumentException("Invalid points ID") }

        if (points.subcategory.edition == null){
            throw IllegalArgumentException("Subcategory has no edition")
        }

        if (currentUser.role == UsersRoles.TEACHER){
            if (points.student.userGroups.none { it.group.teacher.userId == currentUser.userId }){
                throw IllegalArgumentException("Teacher can only edit points for students from their groups")
            }
        }

        val updatedById = currentUser.userId

        if (points.subcategory.edition?.endDate?.isBefore(java.time.LocalDate.now()) == true){
            throw IllegalArgumentException("Subcategory's edition has already ended")
        }

        if (bonusRepository.findByPoints(points).isNotEmpty()) {
            throw IllegalArgumentException("Points with bonuses cannot be edited")
        }

        value?.let { newValue ->
            if (newValue < 0) {
                throw IllegalArgumentException("Value cannot be negative")
            }

            if (newValue > points.subcategory.maxPoints.toFloat()) {
                throw IllegalArgumentException("Student cannot have more than ${points.subcategory.maxPoints} points in this subcategory")
            }

            points.value = newValue.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        updatedById.let {
            val updatedBy = usersRepository.findByUserId(it)
                .orElseThrow { IllegalArgumentException("Invalid user ID") }
            if (updatedBy.role != UsersRoles.TEACHER && updatedBy.role != UsersRoles.COORDINATOR) {
                throw IllegalArgumentException("Points can only be updated by a teacher or coordinator")
            }
            points.updatedBy = updatedBy
        }

        val savedPoints = pointsRepository.save(points)

        val bonusesMultiplicative = bonusRepository.findByAward_AwardTypeAndPoints_Student(AwardType.MULTIPLICATIVE, points.student)
            .filter { bonus -> bonus.points.subcategory.edition == points.subcategory.edition }
            .filter { bonus -> bonus.points.subcategory.category == points.subcategory.category }

        val bonusesAdditivePrev = bonusRepository.findByAward_AwardTypeAndPoints_Student(AwardType.ADDITIVE_PREV, points.student)
            .filter { bonus -> bonus.points.subcategory.edition == points.subcategory.edition }
            .filter { bonus -> bonus.points.subcategory.category == points.subcategory.category }

        bonusesMultiplicative.forEach { bonus ->
            bonus.updateMultiplicativePoints(bonusRepository, pointsRepository)
        }
        bonusesAdditivePrev.forEach { bonus ->
            bonus.updateAdditivePrevPoints(bonusRepository, pointsRepository)
        }

        return savedPoints
    }

    private fun removePointsHelper(pointsId: Long) : Boolean{
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            throw IllegalArgumentException("Only teachers and coordinators can remove points")
        }

        val points = pointsRepository.findById(pointsId)
            .orElseThrow { IllegalArgumentException("Invalid points ID") }

        if (points.subcategory.edition == null){
            throw IllegalArgumentException("Subcategory has no edition")
        }

        if (currentUser.role == UsersRoles.TEACHER){
            if (points.student.userGroups.none { it.group.teacher.userId == currentUser.userId }){
                throw IllegalArgumentException("Teacher can only remove points for students from their groups")
            }
        }

        if (points.subcategory.edition?.endDate?.isBefore(java.time.LocalDate.now()) == true){
            throw IllegalArgumentException("Subcategory's edition has already ended")
        }
        if (bonusRepository.findByPoints(points).isNotEmpty()) {
            throw IllegalArgumentException("Points from bonuses cannot be deleted")
        }

        val bonusesMultiplicative = bonusRepository.findByAward_AwardTypeAndPoints_Student(AwardType.MULTIPLICATIVE, points.student)
            .filter { bonus -> bonus.points.subcategory.edition == points.subcategory.edition }
            .filter { bonus -> bonus.points.subcategory.category == points.subcategory.category }
        val bonusesAdditivePrev = bonusRepository.findByAward_AwardTypeAndPoints_Student(AwardType.ADDITIVE_PREV, points.student)
            .filter { bonus -> bonus.points.subcategory.edition == points.subcategory.edition }
            .filter { bonus -> bonus.points.subcategory.category == points.subcategory.category }

        pointsRepository.delete(points)

        bonusesMultiplicative.forEach { bonus ->
            bonus.updateMultiplicativePoints(bonusRepository, pointsRepository)
        }
        bonusesAdditivePrev.forEach { bonus ->
            bonus.updateAdditivePrevPoints(bonusRepository, pointsRepository)
        }
        return true
    }
}

data class GroupPoints(
    val student: Users,
    val points: Points?
)

data class GroupPointsInput(
    val studentId: Long,
    val value: Float?
)