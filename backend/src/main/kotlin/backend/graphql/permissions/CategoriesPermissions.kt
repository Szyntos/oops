package backend.graphql.permissions

import backend.award.AwardRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.gradingChecks.GradingChecksRepository
import backend.graphql.CategoryWithPermissions
import backend.graphql.SubcategoryInput
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.Permission
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getBooleanField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.JsonNodeExtensions.getSubcategoryInputList
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.RoundingMode
import java.time.LocalDate
import kotlin.jvm.optionals.getOrNull

@Service
class CategoriesPermissions {

    @Autowired
    private lateinit var editionRepository: EditionRepository

    @Autowired
    private lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    private lateinit var gradingChecksRepository: GradingChecksRepository

    @Autowired
    private lateinit var subcategoriesPermissions: SubcategoriesPermissions

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

    fun checkListSetupCategoriesPermission(arguments: JsonNode): Permission {
        val action = "listSetupCategories"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can list setup categories"
            )
        }
        val editionId = arguments.getLongField("editionId")
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid or missing 'editionId'"
            )

        val edition = editionRepository.findById(editionId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition with id $editionId not found"
            )
        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }


    fun checkAddCategoryPermission(arguments: JsonNode): Permission {
        val action = "addCategory"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add categories"
            )
        }

        val categoryName = arguments.getStringField("categoryName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'categoryName'"
        )

        val canAddPoints = arguments.getBooleanField("canAddPoints") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'canAddPoints'"
        )

        val lightColor = arguments.getStringField("lightColor")
        val darkColor = arguments.getStringField("darkColor")

        val subcategories = arguments.getSubcategoryInputList("subcategories")
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid or missing 'subcategories'"
            )

        val categoriesWithSameName = categoriesRepository.findAllByCategoryName(categoryName)
        if (categoriesWithSameName.any { it.canAddPoints == canAddPoints }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category with this name and canAddPoints already exists"
            )
        }
        if (lightColor != null && !isValidHexColor(lightColor)) {
            throw IllegalArgumentException("Invalid light color")
        }
        if (darkColor != null && !isValidHexColor(darkColor)) {
            throw IllegalArgumentException("Invalid dark color")
        }

        val category = Categories(
            categoryName = categoryName,
            canAddPoints = canAddPoints,
            lightColor = lightColor?: "#FFFFFF",
            darkColor = darkColor?: "#000000",
            label = ""
        )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveCategoryPermission(arguments: JsonNode): Permission {
        val action = "removeCategory"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove categories"
            )
        }

        val categoryId = arguments.getLongField("categoryId")
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid or missing 'categoryId'"
            )

        val category = categoriesRepository.findById(categoryId).getOrNull() ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Category with id $categoryId not found"
        )
        if (category.categoryEdition.any { categoryEdition -> categoryEdition.edition.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category is already in an edition that has ended"
            )
        }
        if (category.categoryEdition.any { categoryEdition -> categoryEdition.edition.startDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category is already in an edition that has started"
            )
        }
        if (category.subcategories.any { subcategory -> subcategory.points.isNotEmpty() }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category has subcategories connected to points"
            )
        }
        if (awardRepository.existsByCategory(category)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category is already used in awards"
            )
        }
        if (gradingChecksRepository.existsByProject(category)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category is already used in grading checks"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkEditCategoryPermission(arguments: JsonNode): Permission {
        val action = "editCategory"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can edit categories"
            )
        }

        val categoryId = arguments.getLongField("categoryId")
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid or missing 'categoryId'"
            )

        val categoryName = arguments.getStringField("categoryName")

        val canAddPoints = arguments.getBooleanField("canAddPoints")

        val lightColor = arguments.getStringField("lightColor")

        val darkColor = arguments.getStringField("darkColor")

        val subcategories = arguments.getSubcategoryInputList("subcategories")
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid or missing 'subcategories'"
            )

        val category = categoriesRepository.findById(categoryId).getOrNull() ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Category with id $categoryId not found"
        )

        if (category.categoryEdition.any { it.edition.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category is already in an edition that has ended"
            )
        }
        if (category.categoryEdition.any { it.edition.startDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category is already in an edition that has started"
            )
        }


        lightColor?.let {
            if (!isValidHexColor(it)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid light color"
                )
            }
            category.lightColor = it
        }
        darkColor?.let {
            if (!isValidHexColor(it)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid dark color"
                )
            }
            category.darkColor = it
        }
        categoryName?.let {
            val categoriesWithSameName = categoriesRepository.findAllByCategoryName(it)
            if (categoriesWithSameName.any { existing ->
                    existing.categoryId != categoryId && existing.canAddPoints == canAddPoints
                }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Category with this name and canAddPoints already exists"
                )
            }
            category.categoryName = it
        }
        canAddPoints?.let {
            category.canAddPoints = it
        }

        val editions = category.categoryEdition.map { it.edition }
        // Process input subcategories
        subcategories.forEach { subcategoryInput ->
            val subcategoryId = subcategoryInput.subcategoryId
            if (subcategoryId != null && subcategoryId > 0) {
                // Update existing subcategory
                val existingSubcategory = subcategoriesRepository.findById(subcategoryId).getOrNull()
                    ?: return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "Subcategory with id $subcategoryId not found"
                    )

                if (existingSubcategory.category.categoryId != categoryId) {
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "Subcategory does not belong to the specified category"
                    )
                }

                existingSubcategory.subcategoryName = subcategoryInput.subcategoryName
                existingSubcategory.maxPoints = subcategoryInput.maxPoints.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
                if (subcategoriesRepository.findByCategoryAndOrdinalNumber(category, subcategoryInput.ordinalNumber).filter {it.edition == null}.any { it.subcategoryId != subcategoryId }) {
                    return Permission(
                        action = action,
                        arguments = arguments,
                        allow = false,
                        reason = "Subcategory with this ordinal number already exists"
                    )
                }
                existingSubcategory.ordinalNumber = subcategoryInput.ordinalNumber
                existingSubcategory.label = subcategoryInput.label

            }
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )

    }

    fun checkCopyCategoryPermission(arguments: JsonNode): Permission {
        val action = "copyCategory"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can copy categories"
            )
        }

        val categoryId = arguments.getLongField("categoryId")
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid or missing 'categoryId'"
            )

        val category = categoriesRepository.findById(categoryId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category with id $categoryId not found"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }


    private fun isValidHexColor(color: String): Boolean {
        val hexColorPattern = "^#(?:[0-9a-fA-F]{3}){1,2}$".toRegex()
        return hexColorPattern.matches(color)
    }
}