package backend.graphql

import backend.award.AwardRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEditionRepository
import backend.gradingChecks.GradingChecksRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.RoundingMode
import java.time.LocalDate

@DgsComponent
class CategoriesDataFetcher {
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can add categories")
        }

        val categoriesWithSameName = categoriesRepository.findAllByCategoryName(categoryName)
        if (categoriesWithSameName.any { it.canAddPoints == canAddPoints }) {
            throw IllegalArgumentException("Category with this name and canAddPoints already exists")
        }
        if (!isValidHexColor(lightColor)) {
            throw IllegalArgumentException("Invalid light color")
        }
        if (!isValidHexColor(darkColor)) {
            throw IllegalArgumentException("Invalid dark color")
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can remove categories")
        }

        val category = categoriesRepository.findById(categoryId)
            .orElseThrow { IllegalArgumentException("Invalid category ID") }
        if (category.categoryEdition.any { categoryEdition -> categoryEdition.edition.endDate.isBefore(LocalDate.now()) }) {
            throw IllegalArgumentException("Category is already in an edition that has ended")
        }
        if (category.categoryEdition.any { categoryEdition -> categoryEdition.edition.startDate.isBefore(LocalDate.now()) }) {
            throw IllegalArgumentException("Category is already in an edition that has started")
        }
        if (awardRepository.existsByCategory(category)) {
            throw IllegalArgumentException("Category is already used in awards")
        }
        if (gradingChecksRepository.existsByProject(category)) {
            throw IllegalArgumentException("Category is already used in grading checks")
        }
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can edit categories")
        }

        val category = categoriesRepository.findById(categoryId)
            .orElseThrow { IllegalArgumentException("Invalid category ID") }

        // Check if category can be edited based on editions
        if (categoryName != null || canAddPoints != null || subcategories.isNotEmpty()) {
            if (category.categoryEdition.any { it.edition.endDate.isBefore(LocalDate.now()) }) {
                throw IllegalArgumentException("Category is already in an edition that has ended")
            }
            if (category.categoryEdition.any { it.edition.startDate.isBefore(LocalDate.now()) }) {
                throw IllegalArgumentException("Category is already in an edition that has started")
            }
        }

        lightColor?.let {
            if (!isValidHexColor(it)) {
                throw IllegalArgumentException("Invalid light color")
            }
            category.lightColor = it
        }
        darkColor?.let {
            if (!isValidHexColor(it)) {
                throw IllegalArgumentException("Invalid dark color")
            }
            category.darkColor = it
        }
        categoryName?.let {
            val categoriesWithSameName = categoriesRepository.findAllByCategoryName(it)
            if (categoriesWithSameName.any { existing ->
                    existing.categoryId != categoryId && existing.canAddPoints == canAddPoints
                }) {
                throw IllegalArgumentException("Category with this name and canAddPoints already exists")
            }
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

                if (existingSubcategory.category.categoryId != categoryId) {
                    throw IllegalArgumentException("Subcategory does not belong to the specified category")
                }

                existingSubcategory.subcategoryName = subcategoryInput.subcategoryName
                existingSubcategory.maxPoints = subcategoryInput.maxPoints.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
                if (subcategoriesRepository.findByCategoryAndOrdinalNumber(category, subcategoryInput.ordinalNumber).any { it.subcategoryId != subcategoryId }) {
                    throw IllegalArgumentException("Subcategory with this ordinal number already exists")
                }
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

    private fun isValidHexColor(color: String): Boolean {
        val hexColorPattern = "^#(?:[0-9a-fA-F]{3}){1,2}$".toRegex()
        return hexColorPattern.matches(color)
    }
}
