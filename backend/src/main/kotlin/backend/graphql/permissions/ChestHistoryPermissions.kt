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
                reason = "Tylko prowadzący i koordynatorzy mogą przyznawać skrzynki studentom"
            )
        }

//        @InputArgument userId: Long, @InputArgument chestId: Long, @InputArgument teacherId: Long,
//        @InputArgument subcategoryId: Long

        val userId = arguments.getLongField("userId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'userId'"
        )

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'chestId'"
        )

        val teacherId = arguments.getLongField("teacherId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'teacherId'"
        )

        val subcategoryId = arguments.getLongField("subcategoryId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'subcategoryId'"
        )

        val user = usersRepository.findById(userId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono użytkownika o id $userId"
            )
        if (user.userGroups.isEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik nie istnieje w żadnej grupie"
            )
        }
        if (user.role != UsersRoles.STUDENT) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik musi być studentem"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            if (currentUser.userId != teacherId){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący musi być użytkownikiem wykonującym mutacje"
                )
            }
            val studentGroups = user.userGroups.map { it.group }.filter { it.teacher == currentUser }
            if (studentGroups.isEmpty()){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Student nie jest w grupie prowadzącego"
                )
            }
        }


        val userEditions = user.userGroups.map { it.group.edition }
        if (userEditions.isEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Użytkownik nie istnieje w żadnej edycji"
            )
        }
        val chest = chestsRepository.findById(chestId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono skrzynki o id $chestId"
            )

        val chestEditions = chest.chestEdition.map { it.edition }

        if (userEditions.none { it in chestEditions }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Skrzynka i użytkownik muszą być w tej samej edycji"
            )
        }
        val teacher = usersRepository.findById(teacherId).getOrNull()
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
                reason = "teacherId musi być prowadzącym albo koordynatorem"
            )
        }
        if (teacher.role == UsersRoles.TEACHER && teacher.userGroups.isEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Prowadzący nie ma grup"
            )
        }
        if (teacher.role == UsersRoles.TEACHER && teacher.userGroups.map { it.group.edition }.none { it in chestEditions }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Prowadzący i skrzynka muszą być w tej samej edycji"
            )
        }
        if (teacherId == userId) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Prowadzący i użytkownik nie mogą być tą samą osobą"
            )
        }
        if (teacher.role == UsersRoles.TEACHER && user.userGroups.none { it.group.teacher == teacher }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Prowadzący nie jest prowadzącym grupy studenta"
            )
        }
        val subcategory = subcategoriesRepository.findById(subcategoryId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono podkategorii o id $subcategoryId"
            )
        if (subcategory.edition == null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Podkategoria musi mieć edycję"
            )
        }
        if (chestEditions.none { it == subcategory.edition }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Podkategoria i skrzynka muszą być w tej samej edycji"
            )
        }

        val editionToAdd = subcategory.edition
        if (chest.chestEdition.filter { it.edition == editionToAdd }.none { it.active }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Skrzynka musi być aktywna w tej edycji"
            )
        }

        if (subcategory.edition!!.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja z tą podkategorią już się zakończyła"
            )
        }

        if (subcategory.edition!!.startDate.isAfter(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja z tą podkategorią jeszcze się nie zaczęła"
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
                reason = "Tylko prowadzący i koordynatorzy mogą edytować historię skrzynek"
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
            reason = "Nieprawidłowe lub brakujące 'chestHistoryId'"
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
                reason = "Nie znaleziono chestHistory o id $chestHistoryId"
            )

        val chestEditions = chestHistory.chest.chestEdition.map { it.edition }

        if (chestHistory.subcategory.edition != null) {
            if (chestHistory.subcategory.edition!!.endDate.isBefore(LocalDate.now()) ) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja z tą podkategorią już się zakończyła"
                )
            }
        }


        if (chestHistory.opened){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Skrzynka została już otwarta"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            if (chestHistory.user.userGroups.map { it.group }.none { it.teacher == currentUser }){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący nie jest prowadzącym grupy studenta"
                )
            }
        }

        userId?.let { id ->
            val user = usersRepository.findById(id).getOrNull()
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nie znaleziono użytkownika o id $userId"
                )

            if (user.userGroups.isEmpty()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Użytkownik nie istnieje w żadnej grupie"
                )
            }
            if (user.role != UsersRoles.STUDENT) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Użytkownik musi być studentem"
                )
            }

            if (currentUser.role == UsersRoles.TEACHER){
                val studentGroups = user.userGroups.map { it.group }.filter { it.teacher == currentUser }
                if (studentGroups.isEmpty()){
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "Student nie jest w grupie prowadzącego"
                    )
                }
            }

            val userEditions = user.userGroups.map { group -> group.group.edition }
            if (userEditions.isEmpty()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Użytkownik nie istnieje w żadnej edycji"
                )
            }
            if (userEditions.none { it in chestEditions }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Skrzynka i użytkownik muszą być w tej samej edycji"
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
                    reason = "Nie znaleziono skrzynki o id $chestId"
                )

            if (chestHistory.user.userGroups.map { group -> group.group.edition }.none { edition -> edition in chestEditions }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Skrzynka i użytkownik muszą być w tej samej edycji"
                )
            }
            // check if chest is active in this edition
            if (chest.chestEdition.filter { it.edition == chestHistory.subcategory.edition }.none { it.active }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Skrzynka musi być aktywna w tej edycji"
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
                        reason = "Prowadzący musi być użytkownikiem wykonującym mutacje"
                    )
                }
            }

            val teacher = usersRepository.findById(it).getOrNull()
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
                    reason = "teacherId musi być prowadzącym albo koordynatorem"
                )
            }
            if (teacher.role == UsersRoles.TEACHER && teacher.userGroups.isEmpty()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący nie ma grup"
                )
            }
            if (teacher.role == UsersRoles.TEACHER && teacher.userGroups.map { group -> group.group.edition }.none { edition -> edition in chestEditions }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący i skrzynka muszą być w tej samej edycji"
                )
            }
            if (it == chestHistory.user.userId) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący i użytkownik nie mogą być tą samą osobą"
                )
            }
            if (teacher.role == UsersRoles.TEACHER && chestHistory.user.userGroups.none { group -> group.group.teacher == teacher }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący nie jest prowadzącym grupy studenta"
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
                    reason = "Nie znaleziono podkategorii o id $subcategoryId"
                )
            if (subcategory.edition == null) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Podkategoria musi mieć edycję"
                )
            }
            if (chestEditions.none { it == subcategory.edition }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Podkategoria i skrzynka muszą być w tej samej edycji"
                )
            }
            if (subcategory.edition!!.endDate.isBefore(LocalDate.now())) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja z tą podkategorią już się zakończyła"
                )
            }
            if (subcategory.edition!!.startDate.isAfter(LocalDate.now())) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja z tą podkategorią jeszcze się nie zaczęła"
                )
            }
            if (chestHistory.chest.chestEdition.none { it.edition == subcategory.edition }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Skrzynka i podkategoria muszą być w tej samej edycji"
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
                reason = "Tylko prowadzący i koordynatorzy mogą usuwać skrzynki studentom"
            )
        }

        val chestHistoryId = arguments.getLongField("chestHistoryId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'chestHistoryId'"
        )

        val chestHistory = chestHistoryRepository.findById(chestHistoryId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono chestHistory o id $chestHistoryId"
            )


        if (chestHistory.subcategory.edition != null) {
            if (chestHistory.subcategory.edition!!.endDate.isBefore(LocalDate.now()) ) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja z tą podkategorią już się zakończyła"
                )
            }
        }

        if (chestHistory.opened){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Skrzynka została już otwarta"
            )
        }

        if (currentUser.role == UsersRoles.TEACHER){
            if (chestHistory.user.userGroups.map { it.group }.none { it.teacher == currentUser }){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Prowadzący nie jest prowadzącym grupy studenta"
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