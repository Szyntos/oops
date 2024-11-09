package backend.graphql

import backend.award.AwardRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEditionRepository
import backend.gradingChecks.GradingChecksRepository
import backend.graphql.permissions.PermissionInput
import backend.graphql.permissions.PermissionService
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.RoundingMode
import java.time.LocalDate

@DgsComponent
class CategoriesDataFetcher {
    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var categoryEditionRepository: CategoryEditionRepository

    @Autowired
    private lateinit var gradingChecksRepository: GradingChecksRepository

    @Autowired
    private lateinit var awardRepository: AwardRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    lateinit var subcategoriesDataFetcher: SubcategoriesDataFetcher

    @DgsMutation
    @Transactional
    fun addCategory(@InputArgument categoryName: String, @InputArgument canAddPoints: Boolean,
                    @InputArgument subcategories: List<SubcategoryInput>,
                    @InputArgument lightColor: String = "#FFFFFF", @InputArgument darkColor: String = "#000000",
                 @InputArgument label: String = ""): Categories {
        val action = "addCategory"
        val subcategoriesMap = subcategories.map { subcategory ->
            mapOf(
                "subcategoryId" to subcategory.subcategoryId,
                "subcategoryName" to subcategory.subcategoryName,
                "maxPoints" to subcategory.maxPoints,
                "ordinalNumber" to subcategory.ordinalNumber,
                "categoryId" to subcategory.categoryId,
                "editionId" to subcategory.editionId,
                "label" to subcategory.label
            )
        }

        val arguments = mapOf(
            "categoryName" to categoryName,
            "canAddPoints" to canAddPoints,
            "subcategories" to subcategoriesMap,
            "lightColor" to lightColor,
            "darkColor" to darkColor,
            "label" to label
        )

        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }


        val category = Categories(
            categoryName = categoryName,
            canAddPoints = canAddPoints,
            lightColor = lightColor,
            darkColor = darkColor,
            label = label
        )

        val resultCategory = categoriesRepository.save(category)

        subcategories.forEach {
            it.categoryId = resultCategory.categoryId
            subcategoriesDataFetcher.addSubcategoryHelper(it)
        }

        return resultCategory
    }

    @DgsMutation
    @Transactional
    fun removeCategory(@InputArgument categoryId: Long): Boolean {
        val action = "removeCategory"
        val arguments = mapOf(
            "categoryId" to categoryId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }

        val category = categoriesRepository.findById(categoryId)
            .orElseThrow { IllegalArgumentException("Invalid category ID") }

        val categoryEditions = category.categoryEdition
        categoryEditions.forEach {
            categoryEditionRepository.delete(it)
        }
        val subcategories = subcategoriesRepository.findByCategory(category)
        subcategories.forEach {
            subcategoriesRepository.delete(it)
        }
        categoriesRepository.delete(category)
        return true
    }

    @DgsMutation
    @Transactional
    fun editCategory(
        @InputArgument categoryId: Long,
        @InputArgument categoryName: String?,
        @InputArgument canAddPoints: Boolean?,
        @InputArgument subcategories: List<SubcategoryInput>,
        @InputArgument lightColor: String?,
        @InputArgument darkColor: String?,
        @InputArgument label: String?
    ): Categories {
        val action = "editCategory"
        val subcategoriesMap = subcategories.map { subcategory ->
            mapOf(
                "subcategoryId" to subcategory.subcategoryId,
                "subcategoryName" to subcategory.subcategoryName,
                "maxPoints" to subcategory.maxPoints,
                "ordinalNumber" to subcategory.ordinalNumber,
                "categoryId" to subcategory.categoryId,
                "editionId" to subcategory.editionId,
                "label" to subcategory.label
            )
        }

        val arguments = mapOf(
            "categoryId" to categoryId,
            "categoryName" to categoryName,
            "canAddPoints" to canAddPoints,
            "subcategories" to subcategoriesMap,
            "lightColor" to lightColor,
            "darkColor" to darkColor,
            "label" to label
        )

        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }
        val category = categoriesRepository.findById(categoryId)
            .orElseThrow { IllegalArgumentException("Invalid category ID") }


        lightColor?.let {
            category.lightColor = it
        }
        darkColor?.let {
            category.darkColor = it
        }
        categoryName?.let {
            category.categoryName = it
        }
        canAddPoints?.let {
            category.canAddPoints = it
        }
        label?.let {
            category.label = it
        }
        val subcategoriesInEditions = subcategoriesRepository.findByCategory(category).filter { it.edition != null }
        val editions = category.categoryEdition.map { it.edition }
        subcategoriesInEditions.forEach { subcategory ->
            subcategoriesRepository.delete(subcategory)
        }

        val existingSubcategories = subcategoriesRepository.findByCategory(category)
        val inputSubcategoryIds = subcategories.mapNotNull { it.subcategoryId }.toSet()

        // Remove subcategories not in input list
        existingSubcategories.filter { it.subcategoryId !in inputSubcategoryIds }
            .forEach {
                subcategoriesRepository.delete(it)
            }

        // Process input subcategories
        subcategories.forEach { subcategoryInput ->
            val subcategoryId = subcategoryInput.subcategoryId
            if (subcategoryId != null && subcategoryId > 0) {
                // Update existing subcategory
                val existingSubcategory = subcategoriesRepository.findById(subcategoryId)
                    .orElseThrow { IllegalArgumentException("Invalid subcategory ID: $subcategoryId") }
                existingSubcategory.subcategoryName = subcategoryInput.subcategoryName
                existingSubcategory.maxPoints = subcategoryInput.maxPoints.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
                existingSubcategory.ordinalNumber = subcategoryInput.ordinalNumber
                existingSubcategory.label = subcategoryInput.label
                subcategoriesRepository.save(existingSubcategory)
            } else {
                subcategoryInput.categoryId = categoryId
                subcategoriesDataFetcher.addSubcategoryHelper(subcategoryInput)
            }
        }
        val subcategoriesFromOneEdition = subcategoriesRepository.findByCategory(category)

        editions.forEach { edition ->
                subcategoriesFromOneEdition.forEach {
                        val input = SubcategoryInput(
                            subcategoryName = it.subcategoryName,
                            maxPoints = it.maxPoints.toFloat(),
                            ordinalNumber = it.ordinalNumber,
                            categoryId = it.category.categoryId,
                            editionId = edition.editionId,
                            label = it.label
                        )
                        subcategoriesDataFetcher.addSubcategoryHelper(input)
                    }
            }

        return categoriesRepository.save(category)
    }


}
