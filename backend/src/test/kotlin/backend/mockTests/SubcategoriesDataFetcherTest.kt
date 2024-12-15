import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEdition
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.SubcategoriesDataFetcher
import backend.graphql.SubcategoryInput
import backend.points.PointsRepository
import backend.subcategories.Subcategories
import backend.subcategories.SubcategoriesRepository
import backend.users.Users
import backend.users.UsersRoles
import backend.utils.UserMapper
import io.mockk.*
import io.mockk.junit5.MockKExtension
import org.junit.jupiter.api.*
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.Assertions.*
import java.math.BigDecimal
import java.time.LocalDate
import java.util.*

@ExtendWith(MockKExtension::class)
class SubcategoriesDataFetcherTest {

    private lateinit var subcategoriesDataFetcher: SubcategoriesDataFetcher

    private val userMapper = mockk<UserMapper>()
    private val subcategoriesRepository = mockk<SubcategoriesRepository>()
    private val editionRepository = mockk<EditionRepository>()
    private val categoriesRepository = mockk<CategoriesRepository>()
    private val pointsRepository = mockk<PointsRepository>()
    private val fileEntityRepository = mockk<FileEntityRepository>()

    private val coordinator = Users(
        userId = 2L,
        indexNumber = 2,
        nick = "coordinator",
        firstName = "Test",
        secondName = "coordinator",
        role = UsersRoles.COORDINATOR,
        email = "coordinator@test.com",
        label = "coordinator"
    )

    private val user = Users(
        userId = 1L,
        indexNumber = 1,
        nick = "test",
        firstName = "Test",
        secondName = "User",
        role = UsersRoles.STUDENT,
        email = "test@test.com",
        label = "test"
    )
    private val  edition = Edition(
        editionId = 1L,
        editionName = "Edition Name",
        editionYear = 2023,
        label = "Edition Label",
        startDate = LocalDate.now().plusDays(5),
        endDate = LocalDate.now().plusDays(15)
    )

    private val category = Categories(
        categoryId = 1L,
        categoryName = "Test Category",
        canAddPoints = true,
        label = "Test Label",
        lightColor = "#FFFFFF",
        darkColor = "#000000"
    )

    private val categoryEdition = CategoryEdition(
        categoryEditionId = 1L,
        category = category,
        edition = edition,
        label = "",
    )



    @BeforeEach
    fun setup() {
        subcategoriesDataFetcher = SubcategoriesDataFetcher().apply {
            this.userMapper = this@SubcategoriesDataFetcherTest.userMapper
            this.subcategoriesRepository = this@SubcategoriesDataFetcherTest.subcategoriesRepository
            this.editionRepository = this@SubcategoriesDataFetcherTest.editionRepository
            this.categoriesRepository = this@SubcategoriesDataFetcherTest.categoriesRepository
            this.fileEntityRepository = this@SubcategoriesDataFetcherTest.fileEntityRepository
            this.pointsRepository = this@SubcategoriesDataFetcherTest.pointsRepository
        }
        category.categoryEdition = setOf(categoryEdition)
        edition.categoryEdition = setOf(categoryEdition)

        every { userMapper.getCurrentUser() } returns coordinator
        every { editionRepository.findById(1L) } returns Optional.of(edition)
        every { categoriesRepository.findById(1L) } returns Optional.of(category)
    }

    @Test
    fun `generateSubcategories should create subcategories when valid input is provided`() {
        every { subcategoriesRepository.findByCategoryAndEdition(category, edition) } returns emptyList()
        val subcategories = subcategoriesDataFetcher.generateSubcategories(
            editionId = 1L,
            categoryId = 1L,
            subcategoryPrefix = "TestSub",
            subcategoryCount = 3,
            maxPoints = 10.0f
        )

        assertEquals(3, subcategories.size)
        assertEquals("TestSub_0", subcategories[0].subcategoryName)
        assertEquals(BigDecimal(10).setScale(2), subcategories[0].maxPoints)
    }

    @Test
    fun `generateSubcategories should throw exception if user is not coordinator`() {
        every { userMapper.getCurrentUser() } returns user
        val exception = assertThrows<IllegalArgumentException> {
            subcategoriesDataFetcher.generateSubcategories(
                editionId = 1L,
                categoryId = 1L,
                subcategoryPrefix = "TestSub",
                subcategoryCount = 3,
                maxPoints = 10.0f
            )
        }

        assertEquals("Only coordinators can generate subcategories", exception.message)
    }

    @Test
    fun `addSubcategory should add subcategory when valid input is provided`() {
        every { subcategoriesRepository.existsBySubcategoryNameAndCategory("TestSub", category) } returns false
        every {subcategoriesRepository.findBySubcategoryNameAndCategoryAndEdition(any(), any(), any())} returns Optional.empty()
        every {subcategoriesRepository.findByCategoryAndEdition(any(), any())} returns emptyList()
        every {subcategoriesRepository.save(any())} answers  {firstArg()}

        val subcategoryInput = SubcategoryInput(
            subcategoryName = "TestSub",
            maxPoints = 10.0f,
            ordinalNumber = 0,
            categoryId = 1L,
            editionId = 1L,
            label = "TestLabel"
        )

        val result = subcategoriesDataFetcher.addSubcategory(subcategoryInput)

        assertNotNull(result)
        assertEquals("TestSub", result.subcategoryName)
    }

    @Test
    fun `editSubcategory should update subcategory when valid inputs are provided`() {
        val subcategory = Subcategories(
            subcategoryId = 1L,
            subcategoryName = "TestSub",
            maxPoints = BigDecimal(10).setScale(2),
            ordinalNumber = 0,
            category = category,
            edition = edition,
            label = ""
        )

        every { subcategoriesRepository.findById(1L) } returns Optional.of(subcategory)
        every { subcategoriesRepository.save(any()) } answers { firstArg() }
        every {subcategoriesRepository.findBySubcategoryNameAndCategoryAndEdition(any(), any(), any())} returns Optional.empty()
        every {subcategoriesRepository.findByCategoryAndEdition(any(), any())} returns emptyList()

        val updatedSubcategory = subcategoriesDataFetcher.editSubcategory(
            subcategoryId = 1L,
            subcategoryName = "shrek",
            maxPoints = 15.0f,
            ordinalNumber = 0,
            label = "UpdatedLabel"
        )

        assertEquals("shrek", updatedSubcategory.subcategoryName)
        assertEquals(BigDecimal(15).setScale(2), updatedSubcategory.maxPoints)
        assertEquals("UpdatedLabel", updatedSubcategory.label)
    }

    @Test
    fun `removeSubcategory should delete subcategory if it has no points`() {
        val subcategory = Subcategories(
            subcategoryName = "TestSub",
            maxPoints = BigDecimal(10).setScale(2),
            ordinalNumber = 0,
            category = category,
            edition = edition,
            label = ""
        )

        every { subcategoriesRepository.findById(1L) } returns Optional.of(subcategory)
        every { pointsRepository.findBySubcategory(subcategory) } returns emptyList()
        every { subcategoriesRepository.delete(subcategory) } just Runs

        val result = subcategoriesDataFetcher.removeSubcategory(1L)

        assertTrue(result)
        verify { subcategoriesRepository.delete(subcategory) }
    }

    @Test
    fun `removeSubcategory should throw exception if subcategory has points`() {
        val subcategory = Subcategories(
            subcategoryName = "TestSub",
            maxPoints = BigDecimal(10).setScale(2),
            ordinalNumber = 0,
            category = category,
            edition = edition,
            label = ""
        )

        every { subcategoriesRepository.findById(1L) } returns Optional.of(subcategory)
        every { pointsRepository.findBySubcategory(subcategory) } returns listOf(mockk())

        val exception = assertThrows<IllegalArgumentException> {
            subcategoriesDataFetcher.removeSubcategory(1L)
        }

        assertEquals("Subcategory has points", exception.message)
    }
}
