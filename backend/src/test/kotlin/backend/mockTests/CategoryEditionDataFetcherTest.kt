package backend.mockTests

import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEdition
import backend.categoryEdition.CategoryEditionRepository
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.graphql.CategoryEditionDataFetcher
import backend.subcategories.SubcategoriesRepository
import backend.users.Users
import backend.users.UsersRoles
import backend.utils.UserMapper
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import java.time.LocalDate
import java.util.*

@SpringJUnitConfig
class CategoryEditionDataFetcherTest {

    private lateinit var categoryEditionDataFetcher: CategoryEditionDataFetcher
    private val categoryEditionRepository: CategoryEditionRepository = mockk()
    private val editionRepository: EditionRepository = mockk()
    private val categoriesRepository: CategoriesRepository = mockk()
    private val subcategoriesRepository: SubcategoriesRepository = mockk()

    private val categoryId = 1L
    private val editionId = 1L

    private lateinit var category: Categories
    private lateinit var edition: Edition
    @MockK
    private val userMapper: UserMapper = mockk()
    private val coordinator = Users(
        userId = 2L,
        indexNumber = 2,
        nick = "coordinator",
        firstName = "Test",
        secondName = "Coordinator",
        role = UsersRoles.COORDINATOR,
        email = "coordinator@test.com",
        label = "Coordinator Label"
    )

    @BeforeEach
    fun setUp() {
        categoryEditionDataFetcher = CategoryEditionDataFetcher().apply {
            this.categoryEditionRepository = this@CategoryEditionDataFetcherTest.categoryEditionRepository
            this.editionRepository = this@CategoryEditionDataFetcherTest.editionRepository
            this.categoriesRepository = this@CategoryEditionDataFetcherTest.categoriesRepository
            this.subcategoriesRepository = this@CategoryEditionDataFetcherTest.subcategoriesRepository
            this.userMapper = this@CategoryEditionDataFetcherTest.userMapper
        }

        every {userMapper.getCurrentUser()} returns coordinator

        category = Categories(
            categoryName = "Test Category",
            canAddPoints = true,
            label = "Category Label",
            lightColor = "",
            darkColor = ""
        )

        edition = Edition(
            editionId = editionId,
            editionName = "Edition Name",
            editionYear = 2023,
            label = "Edition Label",
            startDate = LocalDate.now().minusDays(5),
            endDate = LocalDate.now().plusDays(5)
        )
    }

    @Test
    fun `should add category to edition successfully`() {
        val categoryEdition = CategoryEdition(
            category = category,
            edition = edition,
            label = ""
        )

        every { categoriesRepository.findById(categoryId) } returns Optional.of(category)
        every { editionRepository.findById(editionId) } returns Optional.of(edition)
        every { categoryEditionRepository.existsByCategory_CategoryNameAndEdition(category.categoryName, edition) } returns false
        every { categoryEditionRepository.save(any()) } returns categoryEdition
        every {subcategoriesRepository.findByCategory(any())} returns emptyList()

        val result = categoryEditionDataFetcher.addCategoryToEdition(categoryId, editionId)

        assertNotNull(result)
        assertEquals(category, result.category)
        assertEquals(edition, result.edition)

        verify { categoryEditionRepository.save(any()) }
    }

    @Test
    fun `should throw exception when category not found`() {
        every { categoriesRepository.findById(categoryId) } returns Optional.empty()

        assertThrows<IllegalArgumentException> {
            categoryEditionDataFetcher.addCategoryToEdition(categoryId, editionId)
        }
    }

    @Test
    fun `should throw exception when edition not found`() {
        every { categoriesRepository.findById(categoryId) } returns Optional.of(category)
        every { editionRepository.findById(editionId) } returns Optional.empty()

        assertThrows<IllegalArgumentException> {
            categoryEditionDataFetcher.addCategoryToEdition(categoryId, editionId)
        }
    }

    @Test
    fun `should throw exception when edition has already ended`() {
        val pastEdition = Edition(
            editionId = edition.editionId,
            editionName = edition.editionName,
            editionYear = edition.editionYear,
            label = edition.label,
            startDate = edition.startDate,
            endDate = LocalDate.now().minusDays(1)
        )

        every { categoriesRepository.findById(categoryId) } returns Optional.of(category)
        every { editionRepository.findById(editionId) } returns Optional.of(pastEdition)

        assertThrows<IllegalArgumentException> {
            categoryEditionDataFetcher.addCategoryToEdition(categoryId, editionId)
        }
    }

    @Test
    fun `should throw exception when category already exists in the edition`() {
        every { categoriesRepository.findById(categoryId) } returns Optional.of(category)
        every { editionRepository.findById(editionId) } returns Optional.of(edition)
        every { categoryEditionRepository.existsByCategory_CategoryNameAndEdition(category.categoryName, edition) } returns true

        assertThrows<IllegalArgumentException> {
            categoryEditionDataFetcher.addCategoryToEdition(categoryId, editionId)
        }
    }
}
