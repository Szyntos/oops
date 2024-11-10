package backend.graphql.permissions

import backend.award.AwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.Permission
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDate
import kotlin.jvm.optionals.getOrNull

@Service
class ChestHistoryPermissions {

    @Autowired
    private lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    private lateinit var usersRepository: UsersRepository

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

    fun checkAddChestToUserPermission(arguments: JsonNode): Permission {
        val action = "addChestToUser"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can add chests to users"
            )
        }

//        @InputArgument userId: Long, @InputArgument chestId: Long, @InputArgument teacherId: Long,
//        @InputArgument subcategoryId: Long

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'userId'"
        )

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )

        val teacherId = arguments.getLongField("teacherId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'teacherId'"
        )

        val subcategoryId = arguments.getLongField("subcategoryId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'subcategoryId'"
        )

        val user = usersRepository.findById(userId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid user ID"
            )
        if (user.userGroups.isEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User has no groups"
            )
        }
        if (user.role != UsersRoles.STUDENT) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User must be a student"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            if (currentUser.userId != teacherId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher must be the current user"
                )
            }
            val studentGroups = user.userGroups.map { it.group }.filter { it.teacher == currentUser }
            if (studentGroups.isEmpty()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Student is not in a group of the current user"
                )
            }
        }


        val userEditions = user.userGroups.map { it.group.edition }
        if (userEditions.isEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "User has no editions"
            )
        }
        val chest = chestsRepository.findById(chestId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid chest ID"
            )

        if (!chest.active){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Chest is not active"
            )
        }

        val chestEditions = chest.chestEdition.map { it.edition }

        if (userEditions.none { it in chestEditions }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Chest and user must have the same edition"
            )
        }
        val teacher = usersRepository.findById(teacherId).getOrNull()
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
                reason = "Teacher must be a teacher or coordinator"
            )
        }
        if (teacher.userGroups.isEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Teacher has no groups"
            )
        }
        if (teacher.userGroups.map { it.group.edition }.none { it in chestEditions }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Teacher and chest must have the same edition"
            )
        }
        if (teacherId == userId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Teacher and user cannot be the same"
            )
        }
        if (teacher.role == UsersRoles.TEACHER && user.userGroups.none { it.group.teacher == teacher }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Teacher is not a teacher of user's group"
            )
        }
        val subcategory = subcategoriesRepository.findById(subcategoryId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid subcategory ID"
            )
        if (subcategory.edition == null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory must have an edition"
            )
        }
        if (chestEditions.none { it == subcategory.edition }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory and chest must have the same edition"
            )
        }

        if (subcategory.edition!!.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition with this subcategory has already ended"
            )
        }

        if (subcategory.edition!!.startDate.isAfter(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition with this subcategory has not started yet"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkEditChestHistoryPermission(arguments: JsonNode): Permission {
        val action = "editChestHistory"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can edit chest history"
            )
        }

//        @InputArgument chestHistoryId: Long,
//        @InputArgument userId: Long?,
//        @InputArgument chestId: Long?,
//        @InputArgument teacherId: Long?,
//        @InputArgument subcategoryId: Long?,
//        @InputArgument label: String?

        val chestHistoryId = arguments.getLongField("chestHistoryId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestHistoryId'"
        )

        val userId = arguments.getLongField("userId")

        val chestId = arguments.getLongField("chestId")

        val teacherId = arguments.getLongField("teacherId")

        val subcategoryId = arguments.getLongField("subcategoryId")

        val chestHistory = chestHistoryRepository.findById(chestHistoryId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid chest history ID"
            )

        val chestEditions = chestHistory.chest.chestEdition.map { it.edition }

        if (chestHistory.subcategory.edition != null) {
            if (chestHistory.subcategory.edition!!.endDate.isBefore(LocalDate.now()) ) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition with this subcategory has already ended"
                )
            }
        }


        if (chestHistory.opened){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Chest has already been opened"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            if (chestHistory.user.userGroups.map { it.group }.none { it.teacher == currentUser }){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher is not a teacher of student's group"
                )
            }
        }

        userId?.let { id ->
            val user = usersRepository.findById(id).getOrNull()
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid user ID"
                )

            if (user.userGroups.isEmpty()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "User has no groups"
                )
            }
            if (user.role != UsersRoles.STUDENT) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "User must be a student"
                )
            }

            if (currentUser.role == UsersRoles.TEACHER){
                val studentGroups = user.userGroups.map { it.group }.filter { it.teacher == currentUser }
                if (studentGroups.isEmpty()){
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "Student is not in a group of the current user"
                    )
                }
            }

            val userEditions = user.userGroups.map { group -> group.group.edition }
            if (userEditions.isEmpty()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "User has no editions"
                )
            }
            if (userEditions.none { it in chestEditions }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Chest and user must have the same edition"
                )
            }
            chestHistory.user = user
        }

        chestId?.let { newChestId ->
            val chest = chestsRepository.findById(newChestId).getOrNull()
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid chest ID"
                )

            if (chestHistory.user.userGroups.map { group -> group.group.edition }.none { edition -> edition in chestEditions }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Chest and user must have the same edition"
                )
            }
            if (!chest.active){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Chest is not active"
                )
            }
            chestHistory.chest = chest
        }

        teacherId?.let {
            if (currentUser.role == UsersRoles.TEACHER){
                if (currentUser.userId != it){
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "Teacher must be the current user"
                    )
                }
            }

            val teacher = usersRepository.findById(it).getOrNull()
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
                    reason = "Teacher must be a teacher or coordinator"
                )
            }
            if (teacher.userGroups.isEmpty()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher has no groups"
                )
            }
            if (teacher.userGroups.map { group -> group.group.edition }.none { edition -> edition in chestEditions }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher and chest must have the same edition"
                )
            }
            if (it == chestHistory.user.userId) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher and user cannot be the same"
                )
            }
            if (teacher.role == UsersRoles.TEACHER && chestHistory.user.userGroups.none { group -> group.group.teacher == teacher }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher is not a teacher of user's group"
                )
            }
            chestHistory.teacher = teacher
        }

        subcategoryId?.let { newSubcategoryId ->
            val subcategory = subcategoriesRepository.findById(newSubcategoryId).getOrNull()
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid subcategory ID"
                )
            if (subcategory.edition == null) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Subcategory must have an edition"
                )
            }
            if (chestEditions.none { it == subcategory.edition }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Subcategory and chest must have the same edition"
                )
            }
            if (subcategory.edition!!.endDate.isBefore(LocalDate.now())) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition with this subcategory has already ended"
                )
            }
            if (subcategory.edition!!.startDate.isAfter(LocalDate.now())) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition with this subcategory has not started yet"
                )
            }
            if (chestHistory.chest.chestEdition.none { it.edition == subcategory.edition }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Chest and subcategory must have the same edition"
                )
            }
            chestHistory.subcategory = subcategory
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveChestFromUserPermission(arguments: JsonNode): Permission {
        val action = "removeChestFromUser"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.COORDINATOR)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only teachers and coordinators can remove chests from users"
            )
        }

        val chestHistoryId = arguments.getLongField("chestHistoryId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestHistoryId'"
        )

        val chestHistory = chestHistoryRepository.findById(chestHistoryId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid chest history ID"
            )


        if (chestHistory.subcategory.edition != null) {
            if (chestHistory.subcategory.edition!!.endDate.isBefore(LocalDate.now()) ) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition with this subcategory has already ended"
                )
            }
        }

        if (chestHistory.opened){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Chest has already been opened"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            if (chestHistory.user.userGroups.map { it.group }.none { it.teacher == currentUser }){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Teacher is not a teacher of student's group"
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
}