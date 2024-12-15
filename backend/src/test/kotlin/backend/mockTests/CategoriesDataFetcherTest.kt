package backend.mockTests

import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.graphql.CategoriesDataFetcher
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

@SpringJUnitConfig
class CategoriesDataFetcherTest {

    private lateinit var categoriesDataFetcher: CategoriesDataFetcher
    private val categoriesRepository: CategoriesRepository = mockk()
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
        categoriesDataFetcher = CategoriesDataFetcher().apply {
            this.categoriesRepository = this@CategoriesDataFetcherTest.categoriesRepository
            this.userMapper = this@CategoriesDataFetcherTest.userMapper
        }
        every {userMapper.getCurrentUser()} returns coordinator
    }

    @Test
    fun `should add category successfully`() {
        val categoryName = "New Category"
        val canAddPoints = true
        val label = "Test Label"
        val categoriesWithSameName = emptyList<Categories>()

        // Mock the repository behavior
        every { categoriesRepository.findAllByCategoryName(categoryName) } returns categoriesWithSameName
        every { categoriesRepository.save(any()) } answers { firstArg() }

        // Execute the method
        val result = categoriesDataFetcher.addCategory(categoryName, canAddPoints, emptyList(), "#FFFFFF", "#000000", label)

        // Verify the result and repository interactions
        assertNotNull(result)
        assertEquals(categoryName, result.categoryName)
        assertEquals(canAddPoints, result.canAddPoints)
        assertEquals(label, result.label)

        verify { categoriesRepository.save(any()) }
    }

    @Test
    fun `should throw exception when category with the same name and canAddPoints exists`() {
        val categoryName = "Existing Category"
        val canAddPoints = true
        val existingCategory = Categories(
            categoryName = categoryName,
            canAddPoints = canAddPoints,
            label = "Existing Label",
            lightColor = "#FFFFFF",  // Add required parameters
            darkColor = "#000000"     // Add required parameters
        )

        // Mock the repository behavior
        every { categoriesRepository.findAllByCategoryName(categoryName) } returns listOf(existingCategory)

        // Execute the method and check for exception
        val exception = assertThrows<IllegalArgumentException> {
            categoriesDataFetcher.addCategory(categoryName, canAddPoints, emptyList())
        }

        // Verify the exception message
        assertEquals("Category with this name and canAddPoints already exists", exception.message)
    }

    @Test
    fun `should add category when category with same name but different canAddPoints exists`() {
        val categoryName = "Category Name"
        val canAddPoints = true
        val label = "New Label"
        val existingCategory = Categories(
            categoryName = categoryName,
            canAddPoints = false,
            label = "Existing Label",
            lightColor = "#FFFFFF",  // Add required parameters
            darkColor = "#000000"     // Add required parameters
        )

        // Mock the repository behavior
        every { categoriesRepository.findAllByCategoryName(categoryName) } returns listOf(existingCategory)
        every { categoriesRepository.save(any()) } answers { firstArg() }

        // Execute the method
        val result = categoriesDataFetcher.addCategory(categoryName, canAddPoints, emptyList(),"#FFFFFF", "#000000", label)

        // Verify the result and repository interactions
        assertNotNull(result)
        assertEquals(categoryName, result.categoryName)
        assertEquals(canAddPoints, result.canAddPoints)
        assertEquals(label, result.label)

        verify { categoriesRepository.save(any()) }
    }
}
