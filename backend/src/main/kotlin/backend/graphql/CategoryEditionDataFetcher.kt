package backend.graphql

import backend.award.AwardRepository
import backend.awardEdition.AwardEdition
import backend.awardEdition.AwardEditionRepository
import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEdition
import backend.categoryEdition.CategoryEditionRepository
import backend.edition.EditionRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class CategoryEditionDataFetcher {

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
        return addCategoryToEditionHelper(categoryId, editionId)
    }

    @DgsMutation
    @Transactional
    fun removeCategoryFromEdition(@InputArgument categoryId: Long, @InputArgument editionId: Long): Boolean {
        return removeCategoryFromEditionHelper(categoryId, editionId)
    }

    @Transactional
    fun addCategoryToEditionHelper(categoryId: Long, editionId: Long) : CategoryEdition{
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can add categories to editions")
        }

        val category = categoriesRepository.findById(categoryId).orElseThrow { throw IllegalArgumentException("Category not found") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Edition not found") }

        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }
        // TODO: Delete userId check
        if (edition.startDate.isBefore(java.time.LocalDate.now()) && currentUser.userId != 0L){
            throw IllegalArgumentException("Edition has already started")
        }

        if (categoryEditionRepository.existsByCategory_CategoryNameAndEdition(category.categoryName, edition)){
            throw IllegalArgumentException("Category with this name already exists in this edition")
        }

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

        return resultCategoryEdition
    }

    @Transactional
    fun removeCategoryFromEditionHelper(categoryId: Long, editionId: Long): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can remove categories from editions")
        }

        val category = categoriesRepository.findById(categoryId).orElseThrow { throw IllegalArgumentException("Category not found") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Edition not found") }

        if (!categoryEditionRepository.existsByCategoryAndEdition(category, edition)){
            throw IllegalArgumentException("This category does not exist in this edition")
        }

        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }

        if (edition.startDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already started")
        }

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
}
