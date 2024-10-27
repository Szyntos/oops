package backend.mockTests

import backend.award.Award
import backend.award.AwardRepository
import backend.award.AwardType
import backend.awardEdition.AwardEdition
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.AwardsDataFetcher
import backend.graphql.PhotoAssigner
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.Users
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import io.mockk.*
import io.mockk.impl.annotations.MockK
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import java.math.BigDecimal
import java.math.RoundingMode
import java.util.*

@SpringJUnitConfig
class AwardsDataFetcherTest {

    private lateinit var awardsDataFetcher: AwardsDataFetcher

    @MockK
    private val userMapper: UserMapper = mockk()

    private val bonusesRepository: BonusesRepository = mockk()
    private val usersRepository: UsersRepository = mockk()
    private val pointsRepository: PointsRepository = mockk()
    private val categoriesRepository: CategoriesRepository = mockk()
    private val subcategoriesRepository: SubcategoriesRepository = mockk()
    private val groupsRepository: GroupsRepository = mockk()
    private val editionRepository: EditionRepository = mockk()
    private val awardRepository: AwardRepository = mockk()
    private val photoAssigner: PhotoAssigner = mockk()

    private val awardId = 1L
    private val fileId = 2L
    private val categoryId = 1L
    private val awardName = "Test Award"
    private val awardType = AwardType.ADDITIVE
    private val awardValue = 10.0f
    private val maxUsages = 5
    private val category = Categories(
        categoryName = "Test Category",
        canAddPoints = true,
        label = "Test Label",
        lightColor = "#FFFFFF",
        darkColor = "#000000"
    )

    @BeforeEach
    fun setUp() {
        awardsDataFetcher = AwardsDataFetcher().apply {
            this.bonusesRepository = this@AwardsDataFetcherTest.bonusesRepository
            this.usersRepository = this@AwardsDataFetcherTest.usersRepository
            this.pointsRepository = this@AwardsDataFetcherTest.pointsRepository
            this.categoriesRepository = this@AwardsDataFetcherTest.categoriesRepository
            this.subcategoriesRepository = this@AwardsDataFetcherTest.subcategoriesRepository
            this.groupsRepository = this@AwardsDataFetcherTest.groupsRepository
            this.editionRepository = this@AwardsDataFetcherTest.editionRepository
            this.awardRepository = this@AwardsDataFetcherTest.awardRepository
            this.photoAssigner = this@AwardsDataFetcherTest.photoAssigner
            this.userMapper = this@AwardsDataFetcherTest.userMapper // inject mock UserMapper
        }

        every { userMapper.getCurrentUser() } returns mockk<Users>().apply {
            every { role } returns UsersRoles.COORDINATOR
        }
    }

    @Test
    fun `should assign photo to award successfully`() {
        every { photoAssigner.assignPhotoToAssignee(awardRepository, "image/award", awardId, fileId) } returns true

        val result = awardsDataFetcher.assignPhotoToAward(awardId, fileId)

        assertTrue(result)
        verify { photoAssigner.assignPhotoToAssignee(awardRepository, "image/award", awardId, fileId) }
    }

    @Test
    fun `should add award successfully`() {
        val awardsWithSameName = emptyList<Award>()
        val awardValueBigDecimal = BigDecimal.valueOf(awardValue.toDouble())

        every { categoriesRepository.findById(categoryId) } returns Optional.of(category)
        every { awardRepository.findAllByAwardName(awardName) } returns awardsWithSameName
        every { awardRepository.save(any()) } answers { firstArg() }

        val result = awardsDataFetcher.addAward(
            awardName = awardName,
            awardType = awardType.toString(),
            awardValue = awardValue,
            categoryId = categoryId,
            maxUsages = maxUsages,
            label = "Test Label",
            description = ""
        )

        assertNotNull(result)
        assertEquals(awardName, result.awardName)
        assertEquals(awardType, result.awardType)
        assertEquals(awardValueBigDecimal.setScale(2), result.awardValue.setScale(2))
        assertEquals(maxUsages, result.maxUsages)

        verify { awardRepository.save(any()) }
    }

    @Test
    fun `should throw exception for invalid award type`() {
        val invalidAwardTypeString = "INVALID_TYPE"

        assertThrows<IllegalArgumentException> {
            awardsDataFetcher.addAward(
                awardName = awardName,
                awardType = invalidAwardTypeString,
                awardValue = awardValue,
                categoryId = categoryId,
                maxUsages = maxUsages,
                label = "Test Label",
                description = ""
            )
        }
    }

    @Test
    fun `should throw exception when award value is out of bounds for additive type`() {
        val negativeAwardValue = -5.0f

        assertThrows<IllegalArgumentException> {
            awardsDataFetcher.addAward(
                awardName = "Negative Value Award",
                awardType = AwardType.ADDITIVE.toString(),
                awardValue = negativeAwardValue,
                categoryId = categoryId,
                maxUsages = maxUsages,
                label = "Test Label",
                description = ""
            )
        }
    }

    @Test
    fun `should throw exception when award value is out of bounds for multiplicative type`() {
        val outOfBoundsValue = 1.5f

        assertThrows<IllegalArgumentException> {
            awardsDataFetcher.addAward(
                awardName = "Invalid Multiplicative Award",
                awardType = AwardType.MULTIPLICATIVE.toString(),
                awardValue = outOfBoundsValue,
                categoryId = categoryId,
                maxUsages = maxUsages,
                label = "Test Label",
                description = ""
            )
        }
    }

    @Test
    fun `should throw exception when award with the same name and value already exists`() {
        val existingAward = Award(
            awardName = awardName,
            awardType = awardType,  // This is AwardType, not a String, no need to call .toString()
            awardValue = BigDecimal(awardValue.toDouble()).setScale(2, RoundingMode.HALF_UP),  // Convert to BigDecimal with correct scale
            category = category,
            maxUsages = maxUsages,
            awardEditions = emptySet(),  // Use empty set for this test
            description = "",
            label = "Test Label",
            imageFile = null
        )

        // Mock the repository to return the existing award
        every { categoriesRepository.findById(categoryId) } returns Optional.of(category)
        every { awardRepository.findAllByAwardName(awardName) } returns listOf(existingAward)

        // This is just a safeguard, you can mock it as needed for other tests
        every { awardRepository.save(any()) } answers { mockk() }

        // Now assert that the exception is thrown
        val exception = assertThrows<IllegalArgumentException> {
            awardsDataFetcher.addAward(
                awardName = awardName,
                awardType = awardType.toString(),
                awardValue = awardValue,  // Assuming awardValue is a Float or Double, this needs to match BigDecimal in logic
                categoryId = categoryId,
                maxUsages = maxUsages,
                label = "Test Label",
                description = ""
            )
        }

        // Optional: Assert the exception message, if there's a custom one
        assertEquals("Award with this name and value already exists", exception.message)
    }



}
