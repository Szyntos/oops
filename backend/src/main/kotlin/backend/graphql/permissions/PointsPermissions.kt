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
import backend.graphql.GroupPoints
import backend.graphql.GroupPointsInput
import backend.graphql.utils.PhotoAssigner
import backend.levels.LevelsRepository
import backend.graphql.utils.Permission
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getBooleanField
import backend.utils.JsonNodeExtensions.getFloatField
import backend.utils.JsonNodeExtensions.getGroupPointsInputList
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.RoundingMode
import kotlin.jvm.optionals.getOrNull

@Service
class PointsPermissions {

    @Autowired
    private lateinit var groupsRepository: GroupsRepository

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
                reason = "Tylko prowadzący i koordynatorzy mogą dodawać punkty"
            )
        }

        val studentId = arguments.getLongField("studentId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'studentId'"
        )

        val teacherId = arguments.getLongField("teacherId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'teacherId'"
        )

        val value = arguments.getFloatField("value") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'value'"
        )

        val subcategoryId = arguments.getLongField("subcategoryId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'subcategoryId'"
        )


        val checkDates = arguments.getBooleanField("checkDates") ?: true

        val permission = checkAddPointsHelperPermission(studentId, teacherId, value, subcategoryId, checkDates)
        if (!permission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = permission.reason
            )
        }
        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddPointsToGroupPermission(arguments: JsonNode): Permission {
        val action = "addPointsToGroup"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko prowadzący i koordynatorzy mogą dodawać punkty"
            )
        }

        val groupId = arguments.getLongField("groupId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'groupId'"
        )

        val teacherId = arguments.getLongField("teacherId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'teacherId'"
        )

        val values = arguments.getGroupPointsInputList("values") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'values'"
        )

        val subcategoryId = arguments.getLongField("subcategoryId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'subcategoryId'"
        )

        val checkDates = arguments.getBooleanField("checkDates") ?: true


        val group = groupsRepository.findById(groupId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono grupy o id $groupId"
            )

        val studentsInGroup = group.userGroups.map { it.user }
            .filter { it.role == UsersRoles.STUDENT }

        val teacher = usersRepository.findByUserId(teacherId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono nauczyciela o id $teacherId"
            )

        val subcategory = subcategoriesRepository.findById(subcategoryId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono podkategorii o id $subcategoryId"
            )

        if (values.map { it.studentId }.toSet() != studentsInGroup.map{it.userId}.toSet()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Studenci w grupie i w wejściu nie zgadzają się"
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
                reason = "Tylko prowadzący i koordynatorzy mogą edytować punkty"
            )
        }

        val pointsId = arguments.getLongField("pointsId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'pointsId'"
        )

        val value = arguments.getFloatField("value")

        val permission = checkEditPointsHelperPermission(pointsId, value)
        if (!permission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = permission.reason
            )
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
                reason = "Tylko prowadzący i koordynatorzy mogą usuwać punkty"
            )
        }

        val pointsId = arguments.getLongField("pointsId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'pointsId'"
        )

        val permission = checkRemovePointsHelperPermission(pointsId)
        if (!permission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = permission.reason
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddPointsHelperPermission(studentId: Long, teacherId: Long, value: Float,
                                       subcategoryId: Long, checkDates: Boolean = true): Permission {
        val action = "addPointsHelper"
        val arguments = objectMapper.valueToTree<JsonNode>(
            mapOf(
                "studentId" to studentId,
                "teacherId" to teacherId,
                "value" to value,
                "subcategoryId" to subcategoryId,
                "checkDates" to checkDates
            )
        )
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko prowadzący i koordynatorzy mogą dodawać punkty"
            )
        }

        val studentId = arguments.getLongField("studentId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'studentId'"
        )

        val teacherId = arguments.getLongField("teacherId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'teacherId'"
        )

        val value = arguments.getFloatField("value") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'value'"
        )

        val subcategoryId = arguments.getLongField("subcategoryId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'subcategoryId'"
        )


        val checkDates = arguments.getBooleanField("checkDates") ?: true

        val student = usersRepository.findByUserId(studentId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono studenta o id $studentId"
            )

        if (currentUser.role == UsersRoles.TEACHER){
            if (teacherId != currentUser.userId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący może dodawać punkty tylko jako on sam"
                )
            }
            val studentTeachers = student.userGroups.map { it.group.teacher }.distinct()
            if (!studentTeachers.contains(currentUser)){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący może dodawać punkty tylko studentom z jego grup"
                )
            }
        }

        val teacher = usersRepository.findByUserId(teacherId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono nauczyciela o id $teacherId"
            )

        val subcategory = subcategoriesRepository.findById(subcategoryId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono podkategorii o id $subcategoryId"
            )
        if (subcategory.edition == null){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Podkategoria $subcategoryId nie ma wybranej edycji"
            )
        }

        if (checkDates){
            if (subcategory.edition?.startDate?.isAfter(java.time.LocalDate.now()) == true){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja podkategorii jeszcze się nie zaczęła"
                )
            }
            if (subcategory.edition?.endDate?.isBefore(java.time.LocalDate.now()) == true){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja podkategorii już się zakończyła"
                )
            }
        }
        if (!subcategory.category.canAddPoints) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Kategoria tej podkategorii nie pozwala na dodawanie punktów"
            )
        }

        if (teacher.role != UsersRoles.TEACHER && teacher.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Punkty mogą dodawać tylko prowadzący i koordynatorzy"
            )
        }
        if (student.role != UsersRoles.STUDENT) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Punkty mogą być dodawane tylko do studenta"
            )
        }

        if (teacher.role == UsersRoles.TEACHER && student.userGroups.none { it.group.teacher == teacher }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Prowadzący nie jest prowadzącym grupy studenta"
            )
        }

        val studentEditions = student.userGroups.map { it.group.edition }.distinct()
        if (!studentEditions.contains(subcategory.edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student nie uczestniczy w edycji podkategorii"
            )
        }
        val teacherEditions = teacher.userGroups.map { it.group.edition }.distinct()
        if (!teacherEditions.contains(subcategory.edition)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Prowadzący nie uczestniczy w edycji podkategorii"
            )
        }
        if (value < 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Wartość nie może być ujemna"
            )
        }
        if (value > subcategory.maxPoints.toFloat()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student nie może mieć więcej niż ${subcategory.maxPoints} punktów w tej podkategorii"
            )
        }
        val studentPoints = student.getPointsBySubcategory(subcategoryId, pointsRepository)
        val studentPointsWithoutBonuses = studentPoints.filter { bonusesRepository.findByPoints(it).isEmpty() }
        if (studentPointsWithoutBonuses.isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Student ma już punkty w tej podkategorii"
            )
        }
        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkEditPointsHelperPermission(pointsId: Long, value: Float?): Permission {
        val action = "editPointsHelper"
        val arguments = objectMapper.valueToTree<JsonNode>(
            mapOf(
                "pointsId" to pointsId,
                "value" to value
            )
        )
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko prowadzący i koordynatorzy mogą edytować punkty"
            )
        }

        val pointsId = arguments.getLongField("pointsId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'pointsId'"
        )

        val value = arguments.getFloatField("value")

        val points = pointsRepository.findById(pointsId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono punktów o id $pointsId"
            )

        if (points.subcategory.edition == null){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Podkategoria ${points.subcategory} nie ma wybranej edycji"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            if (points.student.userGroups.none { it.group.teacher.userId == currentUser.userId }){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący może edytować punkty tylko dla studentów ze swoich grup"
                )
            }
        }

        val updatedById = currentUser.userId

        if (points.subcategory.edition?.endDate?.isBefore(java.time.LocalDate.now()) == true){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja podkategorii już się zakończyła"
            )
        }

        if (bonusesRepository.findByPoints(points).isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Punkty z łupów nie mogą być edytowane"
            )
        }

        value?.let { newValue ->
            if (newValue < 0) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Warotść nie może być ujemna"
                )
            }

            if (newValue > points.subcategory.maxPoints.toFloat()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Student nie może mieć więcej niż ${points.subcategory.maxPoints} punktów w tej podkategorii"
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
                    reason = "Nie znaleziono użytkownika o id $it"
                )
            if (updatedBy.role != UsersRoles.TEACHER && updatedBy.role != UsersRoles.COORDINATOR) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Punty mogą być edytowane tylko przez prowadzących i koordynatorów"
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
    fun checkRemovePointsHelperPermission(pointsId: Long): Permission {
        val action = "removePoints"
        val arguments = objectMapper.valueToTree<JsonNode>(
            mapOf(
                "pointsId" to pointsId
            )
        )
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko prowadzący i koordynatorzy mogą usuwać punkty"
            )
        }

        val pointsId = arguments.getLongField("pointsId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'pointsId'"
        )

        val points = pointsRepository.findById(pointsId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono punktów o id $pointsId"
            )

        if (points.subcategory.edition == null){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Podkategoria ${points.subcategory} nie ma wybranej edycji"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            if (points.student.userGroups.none { it.group.teacher.userId == currentUser.userId }){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący może usuwać punkty tylko dla studentów ze swoich grup"
                )
            }
        }

        if (points.subcategory.edition?.endDate?.isBefore(java.time.LocalDate.now()) == true){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja podkategorii już się zakończyła"
            )
        }
        if (bonusesRepository.findByPoints(points).isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Punkty z łupów nie mogą być usuwane"
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