package backend.graphql.permissions

import backend.award.AwardRepository
import backend.bonuses.BonusesRepository
import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEditionRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.gradingChecks.GradingChecksRepository
import backend.graphql.utils.PhotoAssigner
import backend.levels.LevelsRepository
import backend.graphql.utils.Permission
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getBooleanField
import backend.utils.JsonNodeExtensions.getFloatField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.RoundingMode
import kotlin.jvm.optionals.getOrNull

@Service
class PointsPermissions {

    @Autowired
    private lateinit var bonusesRepository: BonusesRepository

    @Autowired
    private lateinit var pointsRepository: PointsRepository

    @Autowired
    private lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    private lateinit var usersRepository: UsersRepository

    @Autowired
    private lateinit var categoryEditionRepository: CategoryEditionRepository

    @Autowired
    private lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    private lateinit var levelsRepository: LevelsRepository

    @Autowired
    private lateinit var gradingChecksRepository: GradingChecksRepository

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

    fun checkAddPointsPermission(arguments: JsonNode): Permission {
        val action = "addPoints"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can add points"
            )
        }

        val studentId = arguments.getLongField("studentId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'studentId'"
        )

        val teacherId = arguments.getLongField("teacherId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'teacherId'"
        )

        val value = arguments.getFloatField("value") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'value'"
        )

        val subcategoryId = arguments.getLongField("subcategoryId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'subcategoryId'"
        )


        val checkDates = arguments.getBooleanField("checkDates") ?: true

        val student = usersRepository.findByUserId(studentId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid student ID"
            )

        if (currentUser.role == UsersRoles.TEACHER){
            if (teacherId != currentUser.userId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only add points as themselves"
                )
            }
            val studentTeachers = student.userGroups.map { it.group.teacher }.distinct()
            if (!studentTeachers.contains(currentUser)){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only add points to students from their groups"
                )
            }
        }

        val teacher = usersRepository.findByUserId(teacherId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid teacher ID"
            )

        val subcategory = subcategoriesRepository.findById(subcategoryId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid subcategory ID"
            )
        if (subcategory.edition == null){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory has no edition"
            )
        }

        if (checkDates){
            if (subcategory.edition?.startDate?.isAfter(java.time.LocalDate.now()) == true){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Subcategory's edition has not started yet"
                )
            }
            if (subcategory.edition?.endDate?.isBefore(java.time.LocalDate.now()) == true){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Subcategory's edition has already ended"
                )
            }
        }
        if (!subcategory.category.canAddPoints) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "This subcategory's category does not allow adding points"
            )
        }

        if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Points can be added only by teacher or coordinator"
            )
        }
        if (student.role != UsersRoles.STUDENT) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Points can be added only to student"
            )
        }

        if (teacher.role == UsersRoles.TEACHER && student.userGroups.none { it.group.teacher == teacher }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Teacher is not a teacher of student's group"
            )
        }

        val studentEditions = student.userGroups.map { it.group.edition }.distinct()
        if (!studentEditions.contains(subcategory.edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student is not participating in subcategory edition"
            )
        }
        val teacherEditions = teacher.userGroups.map { it.group.edition }.distinct()
        if (!teacherEditions.contains(subcategory.edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Teacher is not participating in subcategory edition"
            )
        }
        if (value < 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Value cannot be negative"
            )
        }
        val studentPoints = student.getPointsBySubcategory(subcategoryId, pointsRepository)
        val studentPointsWithoutBonuses = studentPoints.filter { bonusesRepository.findByPoints(it).isEmpty() }
        if (studentPointsWithoutBonuses.isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "This student already has points in this subcategory"
            )
        }
        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkEditPointsPermission(arguments: JsonNode): Permission {
        val action = "editPoints"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can edit points"
            )
        }

        val pointsId = arguments.getLongField("pointsId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'pointsId'"
        )

        val value = arguments.getFloatField("value")

        val points = pointsRepository.findById(pointsId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid points ID"
            )

        if (points.subcategory.edition == null){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory has no edition"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            if (points.student.userGroups.none { it.group.teacher.userId == currentUser.userId }){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only edit points for students from their groups"
                )
            }
        }

        val updatedById = currentUser.userId

        if (points.subcategory.edition?.endDate?.isBefore(java.time.LocalDate.now()) == true){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory's edition has already ended"
            )
        }

        if (bonusesRepository.findByPoints(points).isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Points with bonuses cannot be edited"
            )
        }

        value?.let { newValue ->
            if (newValue < 0) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Value cannot be negative"
                )
            }

            if (newValue > points.subcategory.maxPoints.toFloat()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Student cannot have more than ${points.subcategory.maxPoints} points in this subcategory"
                )
            }

            points.value = newValue.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        updatedById.let {
            val updatedBy = usersRepository.findByUserId(it).orElse(null)
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid user ID"
                )
            if (updatedBy.role != UsersRoles.TEACHER && updatedBy.role != UsersRoles.COORDINATOR) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Points can only be updated by a teacher or coordinator"
                )
            }
            points.updatedBy = updatedBy
        }


        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemovePointsPermission(arguments: JsonNode): Permission {
        val action = "removePoints"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can remove points"
            )
        }

        val pointsId = arguments.getLongField("pointsId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'pointsId'"
        )

        val points = pointsRepository.findById(pointsId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid points ID"
            )

        if (points.subcategory.edition == null){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory has no edition"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            if (points.student.userGroups.none { it.group.teacher.userId == currentUser.userId }){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher can only remove points for students from their groups"
                )
            }
        }

        if (points.subcategory.edition?.endDate?.isBefore(java.time.LocalDate.now()) == true){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory's edition has already ended"
            )
        }
        if (bonusesRepository.findByPoints(points).isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Points with bonuses cannot be removed"
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