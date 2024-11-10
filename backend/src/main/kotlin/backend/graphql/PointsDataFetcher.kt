package backend.graphql

import backend.points.Points
import backend.points.PointsRepository
import backend.bonuses.BonusesRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.award.AwardType
import backend.graphql.permissions.PermissionDeniedException
import backend.graphql.permissions.PermissionInput
import backend.graphql.permissions.PermissionService
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
    private lateinit var permissionService: PermissionService

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
    fun addPoints(@InputArgument studentId: Long, @InputArgument teacherId: Long, value: Float,
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

        val student = usersRepository.findByUserId(studentId)
            .orElseThrow { IllegalArgumentException("Invalid user ID") }


        val teacher = usersRepository.findByUserId(teacherId)
            .orElseThrow { IllegalArgumentException("Invalid user ID") }

        val subcategory = subcategoriesRepository.findById(subcategoryId)
            .orElseThrow { IllegalArgumentException("Invalid subcategory ID") }
        val points = Points(
            student = student,
            teacher = teacher,
            updatedBy = teacher,
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
