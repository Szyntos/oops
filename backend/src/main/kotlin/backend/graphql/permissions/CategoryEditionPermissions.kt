package backend.graphql.permissions

import backend.award.AwardRepository
import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEdition
import backend.categoryEdition.CategoryEditionRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.gradingChecks.GradingChecksRepository
import backend.graphql.SubcategoryInput
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.Permission
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
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


        if (category.subcategories.filter { it.edition == edition }.any { it.points.isNotEmpty() }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category has points assigned in this edition"
            )
        }

        if (gradingChecksRepository.existsByProjectAndEdition(category, edition)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category has grading checks assigned in this edition"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddCategoryToEditionHelperPermission(categoryId: Long, editionId: Long): Permission {
        val action = "addCategoryToEditionHelper"
        val arguments = objectMapper.valueToTree<JsonNode>(
            mapOf(
                "categoryId" to categoryId,
                "editionId" to editionId
            )
        )
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add categories to editions"
            )
        }

        val category = categoriesRepository.findById(categoryId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category not found"
            )
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition not found"
            )


        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveCategoryFromEditionHelperPermission(categoryId: Long, editionId: Long): Permission {
        val action = "removeCategoryFromEditionHelper"
        val arguments = objectMapper.valueToTree<JsonNode>(
            mapOf(
                "categoryId" to categoryId,
                "editionId" to editionId
            )
        )
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove categories from editions"
            )
        }

        val category = categoriesRepository.findById(categoryId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category not found"
            )
        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition not found"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}