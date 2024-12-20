package backend.graphql

import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEdition
import backend.categoryEdition.CategoryEditionRepository
import backend.edition.EditionRepository
import backend.graphql.permissions.CategoryEditionPermissions
import backend.graphql.utils.PermissionDeniedException
import backend.graphql.utils.PermissionInput
import backend.graphql.utils.PermissionService
import backend.subcategories.SubcategoriesRepository
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class CategoryEditionDataFetcher {

    @Autowired
    private lateinit var categoryEditionPermissions: CategoryEditionPermissions

    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var categoryEditionRepository: CategoryEditionRepository

    @Autowired
    lateinit var editionRepository: EditionRepository

    @Autowired
    lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    lateinit var subcategoriesDataFetcher: SubcategoriesDataFetcher

    @DgsMutation
    @Transactional
    fun addCategoryToEdition(@InputArgument categoryId: Long, @InputArgument editionId: Long): CategoryEdition {
        val action = "addCategoryToEdition"
        val arguments = mapOf(
            "categoryId" to categoryId,
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }
        return addCategoryToEditionHelper(categoryId, editionId)
    }

    @Transactional
    fun addCategoryToEditionHelper(categoryId: Long, editionId: Long) : CategoryEdition{
        val permission = categoryEditionPermissions.checkAddCategoryToEditionHelperPermission(categoryId, editionId)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val category = categoriesRepository.findById(categoryId).orElseThrow { throw IllegalArgumentException("Category not found") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Edition not found") }

        val categoryEdition = CategoryEdition(
            category = category,
            edition = edition,
            label = ""
        )

        val resultCategoryEdition = categoryEditionRepository.save(categoryEdition)

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
                    subcategoriesDataFetcher.addSubcategoryHelper(input)
                }
        }

        val colorPalette = getUniqueRandomColorPalette(editionId)
        resultCategoryEdition.category.lightColor = colorPalette.first
        resultCategoryEdition.category.darkColor = colorPalette.second
        categoriesRepository.save(resultCategoryEdition.category)

        return resultCategoryEdition
    }

    @DgsMutation
    @Transactional
    fun removeCategoryFromEdition(@InputArgument categoryId: Long, @InputArgument editionId: Long): Boolean {
        val action = "removeCategoryFromEdition"
        val arguments = mapOf(
            "categoryId" to categoryId,
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }
        return removeCategoryFromEditionHelper(categoryId, editionId)
    }

    @Transactional
    fun removeCategoryFromEditionHelper(categoryId: Long, editionId: Long): Boolean {
        val permission = categoryEditionPermissions.checkRemoveCategoryFromEditionHelperPermission(categoryId, editionId)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val category = categoriesRepository.findById(categoryId).orElseThrow { throw IllegalArgumentException("Category not found") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Edition not found") }

        val subcategoriesFromEdition = subcategoriesRepository.findByCategoryAndEdition(category, edition)
        val subcategoriesFromOtherEditions = subcategoriesRepository.findByCategory(category)
            .filter { it.edition != edition }
        if (subcategoriesFromOtherEditions.isNotEmpty()){
            subcategoriesFromEdition.forEach {
                subcategoriesRepository.delete(it)
            }
        }
        categoryEditionRepository.deleteByCategoryAndEdition(category, edition)
        return true
    }

    fun getUniqueRandomColorPalette(editionId: Long): Pair<String, String> {
        val colorPalettes = listOf(
            "#DDD9AB" to "#666936",
            "#F4D2A1" to "#8B5D17",
            "#54AA5D" to "#2A512A",
            "#E7BBEC" to "#4D2C44",
            "#99DDC1" to "#176B74",
        )
        val usedColors = categoriesRepository.findByCategoryEdition_Edition_EditionId(editionId).map { it.lightColor to it.darkColor }.toSet()

        val availableColorPalettes = colorPalettes.filter { it !in usedColors }
        if (availableColorPalettes.isEmpty()) {
            return colorPalettes.random()
        }
        return availableColorPalettes.random()
    }
}
