package backend.graphql

import backend.points.Points
import backend.points.PointsRepository
import backend.bonuses.BonusesRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.award.AwardType
import backend.graphql.permissions.PointsPermissions
import backend.graphql.utils.PermissionDeniedException
import backend.graphql.utils.PermissionInput
import backend.graphql.utils.PermissionService
import backend.groups.GroupsRepository
import backend.users.Users
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode

@DgsComponent
class PointsDataFetcher {
    @Autowired
    private lateinit var pointsPermissions: PointsPermissions

    @Autowired
    private lateinit var permissionService: PermissionService

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
        val action = "addPoints"
        val arguments = mapOf(
            "studentId" to studentId,
            "teacherId" to teacherId,
            "value" to value,
            "subcategoryId" to subcategoryId,
            "checkDates" to checkDates
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)

        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }
        return addPointsHelper(studentId, teacherId, value, subcategoryId, checkDates)
    }

    @DgsMutation
    @Transactional
    fun addPointsToGroup(@InputArgument groupId: Long,
                         @InputArgument teacherId: Long,
                         @InputArgument values: List<GroupPointsInput>,
                          @InputArgument subcategoryId: Long,
                         @InputArgument checkDates: Boolean = true): List<GroupPoints> {
        val action = "addPointsToGroup"
        val arguments = mapOf(
            "groupId" to groupId,
            "teacherId" to teacherId,
            "values" to values,
            "subcategoryId" to subcategoryId,
            "checkDates" to checkDates
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }


        val group = groupsRepository.findById(groupId)
            .orElseThrow { IllegalArgumentException("Invalid group ID") }

        val studentsInGroup = group.userGroups.map { it.user }
            .filter { it.role == UsersRoles.STUDENT }

        val teacher = usersRepository.findByUserId(teacherId)
            .orElseThrow { IllegalArgumentException("Invalid teacher ID") }

        val subcategory = subcategoriesRepository.findById(subcategoryId)
            .orElseThrow { IllegalArgumentException("Invalid subcategory ID") }

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

    @DgsMutation
    @Transactional
    fun editPoints(
        @InputArgument pointsId: Long,
        @InputArgument value: Float?
    ): Points {
        val action = "editPoints"
        val arguments = mapOf(
            "pointsId" to pointsId,
            "value" to value
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }
        return editPointsHelper(pointsId, value)
    }

    @DgsMutation
    @Transactional
    fun removePoints(@InputArgument pointsId: Long): Boolean {
        val action = "removePoints"
        val arguments = mapOf(
            "pointsId" to pointsId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }
        return removePointsHelper(pointsId)
    }

    @Transactional
    fun addPointsHelper(studentId: Long, teacherId: Long, value: Float,
                        subcategoryId: Long, checkDates: Boolean = true): Points {
        val permission = pointsPermissions.checkAddPointsHelperPermission(studentId, teacherId, value, subcategoryId, checkDates)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }
        val currentUser = userMapper.getCurrentUser()

        val student = usersRepository.findByUserId(studentId)
            .orElseThrow { IllegalArgumentException("Invalid user ID") }


        val teacher = usersRepository.findByUserId(teacherId)
            .orElseThrow { IllegalArgumentException("Invalid user ID") }

        val subcategory = subcategoriesRepository.findById(subcategoryId)
            .orElseThrow { IllegalArgumentException("Invalid subcategory ID") }
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

    @Transactional
    fun editPointsHelper(pointsId: Long, value: Float?) : Points {
        val permission = pointsPermissions.checkEditPointsHelperPermission(pointsId, value)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val currentUser = userMapper.getCurrentUser()

        val points = pointsRepository.findById(pointsId)
            .orElseThrow { IllegalArgumentException("Invalid points ID") }

        if (points.subcategory.edition == null){
            throw IllegalArgumentException("Subcategory has no edition")
        }

        val updatedById = currentUser.userId

        value?.let { newValue ->
            points.value = newValue.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        updatedById.let {
            val updatedBy = usersRepository.findByUserId(it)
                .orElseThrow { IllegalArgumentException("Invalid user ID") }
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

    @Transactional
    fun removePointsHelper(pointsId: Long) : Boolean{
        val permission = pointsPermissions.checkRemovePointsHelperPermission(pointsId)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val points = pointsRepository.findById(pointsId)
            .orElseThrow { IllegalArgumentException("Invalid points ID") }

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