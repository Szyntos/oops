import backend.award.Award
import backend.award.AwardRepository
import backend.award.AwardType
import backend.awardEdition.AwardEdition
import backend.awardEdition.AwardEditionRepository
import backend.categories.Categories
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.graphql.AwardEditionDataFetcher
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.Users
import backend.users.UsersRoles
import backend.utils.UserMapper
import io.mockk.*
import io.mockk.impl.annotations.MockK
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig
import java.math.BigDecimal
import java.time.LocalDate
import java.util.*

@SpringJUnitConfig
class AwardEditionDataFetcherTest {

    @MockK
    private val userMapper: UserMapper = mockk()
    private lateinit var awardEditionDataFetcher: AwardEditionDataFetcher
    private val awardEditionRepository: AwardEditionRepository = mockk()
    private val pointsRepository: PointsRepository = mockk()
    private val subcategoriesRepository: SubcategoriesRepository = mockk()
    private val editionRepository: EditionRepository = mockk()
    private val awardRepository: AwardRepository = mockk()

    private val awardId = 1L
    private val editionId = 1L

    // Common objects used across tests
    private lateinit var category: Categories
    private lateinit var award: Award
    private lateinit var edition: Edition

    @BeforeEach
    fun setUp() {
        awardEditionDataFetcher = AwardEditionDataFetcher().apply {
            this.awardEditionRepository = this@AwardEditionDataFetcherTest.awardEditionRepository
            this.pointsRepository = this@AwardEditionDataFetcherTest.pointsRepository
            this.subcategoriesRepository = this@AwardEditionDataFetcherTest.subcategoriesRepository
            this.editionRepository = this@AwardEditionDataFetcherTest.editionRepository
            this.awardRepository = this@AwardEditionDataFetcherTest.awardRepository
            this.userMapper = this@AwardEditionDataFetcherTest.userMapper
        }
        every { userMapper.getCurrentUser() } returns mockk<Users>().apply {
            every { role } returns UsersRoles.COORDINATOR
        }

        // Initialize commonly used objects
        category = Categories(
            categoryName = "LABORATORY",
            canAddPoints = true,
            label = "Category Label",
            lightColor = "#000000",
            darkColor = "#111111"
        )

        award = Award(
            awardId = awardId,
            awardName = "Test Award",
            awardType = AwardType.ADDITIVE,
            awardValue = BigDecimal("10.00"), // Use BigDecimal for award value
            category = category,
            maxUsages = 5,
            description = "Award description",
            label = "Award Label"
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
    fun `should add award to edition successfully`() {
        val awardEdition = AwardEdition(award = award, edition = edition, label = "")

        every { awardRepository.findById(awardId) } returns Optional.of(award)
        every { editionRepository.findById(editionId) } returns Optional.of(edition)
        every { awardEditionRepository.existsByAward_AwardNameAndEdition(award.awardName, edition) } returns false
        every { awardEditionRepository.save(any()) } returns awardEdition

        val result = awardEditionDataFetcher.addAwardToEdition(awardId, editionId)

        assertNotNull(result)
        assertEquals(award, result.award)
        assertEquals(edition, result.edition)

        verify { awardEditionRepository.save(any()) }
    }

    @Test
    fun `should throw exception when award not found`() {
        every { awardRepository.findById(awardId) } returns Optional.empty()

        assertThrows<IllegalArgumentException> {
            awardEditionDataFetcher.addAwardToEdition(awardId, editionId)
        }
    }

    @Test
    fun `should throw exception when edition has already ended`() {
        val pastEdition = Edition(
            editionId = editionId,
            editionName = "Past Edition",
            editionYear = 2022,
            label = "Edition Label",
            startDate = LocalDate.now().minusDays(10),
            endDate = LocalDate.now().minusDays(5)
        )

        every { awardRepository.findById(awardId) } returns Optional.of(award)
        every { editionRepository.findById(editionId) } returns Optional.of(pastEdition)

        assertThrows<IllegalArgumentException> {
            awardEditionDataFetcher.addAwardToEdition(awardId, editionId)
        }
    }

    @Test
    fun `should throw exception when award already exists in the edition`() {
        every { awardRepository.findById(awardId) } returns Optional.of(award)
        every { editionRepository.findById(editionId) } returns Optional.of(edition)
        every { awardEditionRepository.existsByAward_AwardNameAndEdition(award.awardName, edition) } returns true

        assertThrows<IllegalArgumentException> {
            awardEditionDataFetcher.addAwardToEdition(awardId, editionId)
        }
    }
}
