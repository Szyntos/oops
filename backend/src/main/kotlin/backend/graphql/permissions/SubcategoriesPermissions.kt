package backend.graphql.permissions

import backend.award.AwardRepository
import backend.categories.CategoriesRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.SubcategoryInput
import backend.graphql.utils.Permission
import backend.points.PointsRepository
import backend.subcategories.Subcategories
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getFloatField
import backend.utils.JsonNodeExtensions.getIntField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.JsonNodeExtensions.getSubcategoryInput
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.RoundingMode
import java.time.LocalDate
import kotlin.jvm.optionals.getOrNull

@Service
class SubcategoriesPermissions {

    @Autowired
    private lateinit var pointsRepository: PointsRepository

    @Autowired
    private lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    private lateinit var editionRepository: EditionRepository

    @Autowired
    private lateinit var categoriesRepository: CategoriesRepository

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

    fun checkGenerateSubcategoriesPermission(arguments: JsonNode): Permission {
        val action = "generateSubcategories"

        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą generować podkategorie"
            )
        }

        val editionId = arguments.getLongField("editionId")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )
        val categoryId = arguments.getLongField("categoryId")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'categoryId'"
        )

        val subcategoryPrefix = arguments.getStringField("subcategoryPrefix")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'subcategoryPrefix'"
        )

        val subcategoryCount = arguments.getIntField("subcategoryCount")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'subcategoryCount'"
        )

        val maxPoints = arguments.getFloatField("maxPoints")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'maxPoints'"
        )

        val edition = editionRepository.findById(editionId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )
        if (edition.endDate.isBefore(LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }
        val category = categoriesRepository.findById(categoryId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono kategorii o id $categoryId"
            )
        if (category.categoryEdition.none { it.edition == edition }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Kategoria o id $categoryId nie istnieje w edycji o id $editionId"
            )
        }
        if (subcategoriesRepository.findByCategoryAndEdition(category, edition).isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Podkategorie dla kategorii o id $categoryId i edycji o id $editionId już istnieją"
            )
        }
        val subcategories = mutableListOf<Subcategories>()
        if (subcategoryCount < 1) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Liczba podkategorii musi być większa od 0"
            )
        }
        if (maxPoints < 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Maksymalna liczba punktów musi być większa lub równa 0"
            )
        }
        if (subcategoryPrefix.isBlank()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Prefiks podkategorii nie może być pusty"
            )
        }
        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddSubcategoryPermission(arguments: JsonNode): Permission {
        val action = "addSubcategory"
        val subcategory = arguments.getSubcategoryInput("subcategory")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'subcategory'"
        )

        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą dodawać podkategorie"
            )
        }

        val permission = checkAddSubcategoryHelperPermission(subcategory)
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
            allow = permission.allow,
            reason = permission.reason
        )
    }

    fun checkEditSubcategoryPermission(arguments: JsonNode): Permission {
        val action = "editSubcategory"
        val subcategoryId = arguments.getLongField("subcategoryId")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'subcategoryId'"
        )

        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą edytować podkategorie"
            )
        }

        val subcategoryName = arguments.getStringField("subcategoryName")

        val maxPoints = arguments.getFloatField("maxPoints")

        val ordinalNumber = arguments.getIntField("ordinalNumber")



        val subcategory = subcategoriesRepository.findById(subcategoryId)
            .getOrNull() ?: return Permission(
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
                reason = "Edycja podkategorii jest nullem"
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


        subcategoryName?.let {
            if (it.isBlank()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nazwa podkategorii nie może być pusta"
                )
            }
            if (subcategoriesRepository.findBySubcategoryNameAndCategoryAndEdition(it, subcategory.category,
                    subcategory.edition!!
                ).isPresent) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Podkategoria o nazwie $it już istnieje w tej samej kategorii i edycji"
                )
            }
            subcategory.subcategoryName = it
        }

        maxPoints?.let {
            if (subcategory.edition!!.startDate.isBefore(java.time.LocalDate.now())){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja podkategorii już się rozpoczęła"
                )
            }
            if (it < 0) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Maksymalna liczba punktów musi być większa lub równa 0"
                )
            }
            subcategory.maxPoints = it.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        ordinalNumber?.let {
            if (subcategory.edition!!.startDate.isBefore(java.time.LocalDate.now())){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja podkategorii już się rozpoczęła"
                )
            }
            if (it < 0) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Liczba porządkowa musi być większa lub równa 0"
                )
            }
            val ordinalNumbers = subcategoriesRepository.findByCategoryAndEdition(subcategory.category,
                subcategory.edition!!
            ).map { it.ordinalNumber }

            if (ordinalNumbers.contains(it) && it != subcategory.ordinalNumber) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Podkategoria o numerze porządkowym $it już istnieje"
                )
            }
            if (ordinalNumbers.isEmpty() && it != 0) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Pierwsza podkategoria musi mieć numer porządkowy 0"
                )
            }
            subcategory.ordinalNumber = it
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveSubcategoryPermission(arguments: JsonNode): Permission {
        val action = "removeSubcategory"
        val subcategoryId = arguments.getLongField("subcategoryId")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'subcategoryId'"
        )

        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą usuwać podkategorie"
            )
        }

        val subcategory = subcategoriesRepository.findById(subcategoryId)
            .getOrNull() ?: return Permission(
                                action = action,
                                arguments = arguments,
                                allow = false,
                                reason = "Nie znaleziono podkategorii o id $subcategoryId"
                                )

        if (subcategory.edition != null && subcategory.edition!!.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja podkategorii już się zakończyła"
            )
        }
        if (pointsRepository.findBySubcategory(subcategory).isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Podkategoria ma przypisane punkty"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddSubcategoryHelperPermission(subcategory: SubcategoryInput): Permission {
        val action = "addSubcategoryHelper"
        val arguments = objectMapper.valueToTree<JsonNode>(mapOf(
            "subcategory" to mapOf(
                "subcategoryId" to subcategory.subcategoryId,
                "subcategoryName" to subcategory.subcategoryName,
                "maxPoints" to subcategory.maxPoints,
                "ordinalNumber" to subcategory.ordinalNumber,
                "categoryId" to subcategory.categoryId,
                "editionId" to subcategory.editionId,
                "label" to subcategory.label
            )
        ))
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą dodawać podkategorie"
            )
        }

        if (subcategory.subcategoryId != null && subcategory.subcategoryId != -1L) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie można określić subcategoryId podczas dodawania nowej podkategorii"
            )
        }
        if (subcategory.categoryId == -1L || subcategory.categoryId == null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "categoryId musi być określone"
            )
        }
        val category = categoriesRepository.findById(subcategory.categoryId!!).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono kategorii o id ${subcategory.categoryId}"
            )

        val edition = if (!(subcategory.editionId == -1L || subcategory.editionId == null)) {
            val edition = editionRepository.findById(subcategory.editionId).getOrNull()
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nie znaleziono edycji o id ${subcategory.editionId}"
                )

            if (edition.endDate.isBefore(LocalDate.now())){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja już się zakończyła"
                )
            }
            if (category.categoryEdition.none { it.edition == edition }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Kategoria o id ${subcategory.categoryId} nie istnieje w edycji o id ${subcategory.editionId}"
                )
            }
            if (subcategoriesRepository.findBySubcategoryNameAndCategoryAndEdition(subcategory.subcategoryName, category, edition).isPresent) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Podkategoria o nazwie ${subcategory.subcategoryName} już istnieje w kategorii o id ${subcategory.categoryId} i edycji o id ${subcategory.editionId}"
                )
            }
            edition
        } else {
            if (subcategoriesRepository.existsBySubcategoryNameAndCategory(subcategory.subcategoryName, category)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Podkategoria o nazwie ${subcategory.subcategoryName} już istnieje w kategorii o id ${subcategory.categoryId}"
                )
            }
            null
        }
        val ordinalNumbers = if (edition != null) {
            subcategoriesRepository.findByCategoryAndEdition(category, edition).map { it.ordinalNumber }
        } else {
            subcategoriesRepository.findByCategory(category).map { it.ordinalNumber }
        }
        if (subcategory.subcategoryName.isBlank()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nazwa podkategorii nie może być pusta"
            )
        }
        if (subcategory.maxPoints < 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Maksymalna liczba punktów musi być większa lub równa 0"
            )
        }
        if (subcategory.ordinalNumber < 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Liczba porządkowa musi być większa lub równa 0"
            )
        }
        if (ordinalNumbers.contains(subcategory.ordinalNumber)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Podkategoria z numerem porządkowym ${subcategory.ordinalNumber} już istnieje"
            )
        }
        if (ordinalNumbers.isEmpty() && subcategory.ordinalNumber != 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Pierwsza podkategoria musi mieć numer porządkowy 0"
            )
        }
        if (ordinalNumbers.isNotEmpty() && ordinalNumbers.max() != subcategory.ordinalNumber - 1) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Liczba porządkowa musi być większa o 1 od poprzedniej podkategorii-(${ordinalNumbers.max()})"
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