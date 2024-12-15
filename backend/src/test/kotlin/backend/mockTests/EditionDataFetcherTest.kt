package backend.mockTests

import backend.award.AwardRepository
import backend.bonuses.BonusesRepository
import backend.categories.CategoriesRepository
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.EditionDataFetcher
import backend.graphql.PhotoAssigner
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.Users
import backend.users.UsersRepository
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
import java.time.LocalDate
import java.util.*

class EditionDataFetcherTest {

    private lateinit var editionDataFetcher: EditionDataFetcher
    private val bonusesRepository: BonusesRepository = mockk()
    private val usersRepository: UsersRepository = mockk()
    private val pointsRepository: PointsRepository = mockk()
    private val categoriesRepository: CategoriesRepository = mockk()
    private val subcategoriesRepository: SubcategoriesRepository = mockk()
    private val groupsRepository: GroupsRepository = mockk()
    private val editionRepository: EditionRepository = mockk()
    private val fileEntityRepository: FileEntityRepository = mockk()
    private val awardRepository: AwardRepository = mockk()
    private val photoAssigner: PhotoAssigner = mockk()

    private val editionName = "Test Edition"
    private val editionYear = LocalDate.now().year + 1
    private val label = "Test Label"

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
        editionDataFetcher = EditionDataFetcher().apply {
            this.bonusesRepository = this@EditionDataFetcherTest.bonusesRepository
            this.usersRepository = this@EditionDataFetcherTest.usersRepository
            this.pointsRepository = this@EditionDataFetcherTest.pointsRepository
            this.categoriesRepository = this@EditionDataFetcherTest.categoriesRepository
            this.subcategoriesRepository = this@EditionDataFetcherTest.subcategoriesRepository
            this.groupsRepository = this@EditionDataFetcherTest.groupsRepository
            this.editionRepository = this@EditionDataFetcherTest.editionRepository
            this.fileEntityRepository = this@EditionDataFetcherTest.fileEntityRepository
            this.awardRepository = this@EditionDataFetcherTest.awardRepository
            this.photoAssigner = this@EditionDataFetcherTest.photoAssigner
            this.userMapper = this@EditionDataFetcherTest.userMapper
        }
        every {userMapper.getCurrentUser()} returns coordinator
    }

    @Test
    fun `should add edition successfully`() {
        every { editionRepository.existsByEditionName(editionName) } returns false
        every { editionRepository.existsByEditionYear(editionYear) } returns false
        every { editionRepository.save(any()) } answers { firstArg() }

        val result = editionDataFetcher.addEdition(editionName, editionYear, label)

        assertNotNull(result)
        assertEquals(editionName, result.editionName)
        assertEquals(editionYear, result.editionYear)
        assertEquals(LocalDate.of(editionYear, 10, 1), result.startDate)
        assertEquals(LocalDate.of(editionYear + 1, 9, 30), result.endDate)
        assertEquals(label, result.label)

        verify { editionRepository.save(any()) }
    }

    @Test
    fun `should throw exception when edition name already exists`() {
        every { editionRepository.existsByEditionName(editionName) } returns true

        assertThrows<IllegalArgumentException> {
            editionDataFetcher.addEdition(editionName, editionYear, label)
        }
    }

    @Test
    fun `should throw exception when edition year already exists`() {
        every { editionRepository.existsByEditionName(editionName) } returns false
        every { editionRepository.existsByEditionYear(editionYear) } returns true

        assertThrows<IllegalArgumentException> {
            editionDataFetcher.addEdition(editionName, editionYear, label)
        }
    }

}
