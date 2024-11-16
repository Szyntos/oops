package backend.graphql.partialPermissions

import backend.award.AwardRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.gradingChecks.GradingChecksRepository
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
class CategoriesPartialPermissions {

    @Autowired
    private lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    private lateinit var gradingChecksRepository: GradingChecksRepository

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

        if (category.subcategories.any { subcategory -> subcategory.points.isNotEmpty() }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category has subcategories connected to points"
            )
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
}