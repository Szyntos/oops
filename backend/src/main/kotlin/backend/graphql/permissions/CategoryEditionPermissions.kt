package backend.graphql.permissions

import backend.award.AwardRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEdition
import backend.categoryEdition.CategoryEditionRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.gradingChecks.GradingChecksRepository
import backend.graphql.PhotoAssigner
import backend.graphql.SubcategoryInput
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getBooleanField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getLongList
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.JsonNodeExtensions.getSubcategoryInputList
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.RoundingMode
import java.time.LocalDate
import kotlin.jvm.optionals.getOrNull

@Service
class CategoryEditionPermissions {

    @Autowired
    private lateinit var categoryEditionRepository: CategoryEditionRepository

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

    fun checkAddCategoryToEditionPermission(arguments: JsonNode): Permission {
        val action = "addCategoryToEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add categories to editions"
            )
        }

        val categoryId = arguments.getLongField("categoryId")
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid or missing 'categoryId'"
            )

        val editionId = arguments.getLongField("editionId")
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid or missing 'editionId'"
            )

        val category = categoriesRepository.findById(categoryId).getOrNull() ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Category not found"
        )

        val edition = editionRepository.findById(editionId).getOrNull() ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Edition not found"
        )

        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }
        // TODO: Delete userId check
        if (edition.startDate.isBefore(java.time.LocalDate.now()) && currentUser.userId != 0L){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already started"
            )
        }

        if (categoryEditionRepository.existsByCategory_CategoryNameAndEdition(category.categoryName, edition)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category with this name already exists in this edition"
            )
        }

        val subcategoriesFromOneEdition = subcategoriesRepository.findByCategory(category)
        if (subcategoriesFromOneEdition.isNotEmpty()){
            val sampleEdition = subcategoriesFromOneEdition[0].edition
            subcategoriesFromOneEdition.filter { it.edition == sampleEdition }
                .forEach {
                    val input = SubcategoryInput(
                        subcategoryName = it.subcategoryName,
                        maxPoints = it.maxPoints.toFloat(),
                        ordinalNumber = it.ordinalNumber,
                        categoryId = it.category.categoryId,
                        editionId = editionId,
                        label = it.label
                    )
                    val permission = subcategoriesPermissions.checkAddSubcategoryHelperPermission(input, category)
                    if (!permission.allow) {
                        return Permission(
                            action = action,
                            arguments = arguments,
                            allow = false,
                            reason = permission.reason
                        )
                    }
                }
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveCategoryFromEditionPermission(arguments: JsonNode): Permission {
        val action = "removeCategoryFromEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove categories from editions"
            )
        }

        val categoryId = arguments.getLongField("categoryId")
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid or missing 'categoryId'"
            )

        val editionId = arguments.getLongField("editionId")
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid or missing 'editionId'"
            )

        val category = categoriesRepository.findById(categoryId).getOrNull() ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Category not found"
        )

        val edition = editionRepository.findById(editionId).getOrNull() ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Edition not found"
        )

        if (!categoryEditionRepository.existsByCategoryAndEdition(category, edition)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "This category does not exist in this edition"
            )
        }

        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        if (edition.startDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already started"
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