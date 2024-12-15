package backend.mockTests

import backend.bonuses.BonusesRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.Chests
import backend.chests.ChestsRepository
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.graphql.ChestHistoryDataFetcher
import backend.groups.Groups
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.subcategories.Subcategories
import backend.subcategories.SubcategoriesRepository
import backend.users.Users
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.userGroups.UserGroups
import backend.userGroups.UserGroupId
import backend.utils.UserMapper
import backend.weekdays.Weekdays
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
class ChestHistoryDataFetcherTest {

    private lateinit var chestHistoryDataFetcher: ChestHistoryDataFetcher
    private val bonusesRepository: BonusesRepository = mockk()
    private val usersRepository: UsersRepository = mockk()
    private val pointsRepository: PointsRepository = mockk()
    private val categoriesRepository: CategoriesRepository = mockk()
    private val subcategoriesRepository: SubcategoriesRepository = mockk()
    private val groupsRepository: GroupsRepository = mockk()
    private val editionRepository: EditionRepository = mockk()
    private val chestsRepository: ChestsRepository = mockk()
    private val chestHistoryRepository: ChestHistoryRepository = mockk()
    private val chestId = 1L
    private val userId = 1L
    private val teacherId = 2L
    private val subcategoryId = 1L

    private lateinit var user: Users
    private lateinit var teacher: Users
    private lateinit var chest: Chests
    private lateinit var subcategory: Subcategories
    private lateinit var edition: Edition
    private lateinit var group: Groups
    private lateinit var weekday: Weekdays

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
        chestHistoryDataFetcher = ChestHistoryDataFetcher().apply {
            this.bonusesRepository = this@ChestHistoryDataFetcherTest.bonusesRepository
            this.usersRepository = this@ChestHistoryDataFetcherTest.usersRepository
            this.pointsRepository = this@ChestHistoryDataFetcherTest.pointsRepository
            this.categoriesRepository = this@ChestHistoryDataFetcherTest.categoriesRepository
            this.subcategoriesRepository = this@ChestHistoryDataFetcherTest.subcategoriesRepository
            this.groupsRepository = this@ChestHistoryDataFetcherTest.groupsRepository
            this.editionRepository = this@ChestHistoryDataFetcherTest.editionRepository
            this.chestsRepository = this@ChestHistoryDataFetcherTest.chestsRepository
            this.chestHistoryRepository = this@ChestHistoryDataFetcherTest.chestHistoryRepository
            this.userMapper = this@ChestHistoryDataFetcherTest.userMapper
        }
        every {userMapper.getCurrentUser()} returns coordinator

        // Initialize objects
        edition = Edition(
            editionId = 1L,
            editionName = "Test Edition",
            editionYear = 2023,
            label = "Edition Label",
            startDate = LocalDate.now().minusDays(10),
            endDate = LocalDate.now().plusDays(10)
        )

        weekday = Weekdays(
            weekdayId = 1L,
            weekdayName = "Monday",
            weekdayAbbr = "M",
            label = "test"
        )
        teacher = Users(
            userId = teacherId,  // Use teacherId here, not userId
            indexNumber = 1234,
            nick = "testTeacher",
            firstName = "Test",
            secondName = "Teacher",
            role = UsersRoles.TEACHER,
            email = "",
            label = "Teacher Label",
            userGroups = emptySet() // You will add the group later
        )

        group = Groups(
            groupName = "Test Group",
            generatedName = "",
            usosId = 1,
            label = "Group Label",
            teacher = teacher,
            weekday = weekday,
            startTime = java.sql.Time.valueOf("09:00:00"),
            endTime = java.sql.Time.valueOf("10:00:00"),
            edition = edition
        )

        val userGroup = UserGroups(
            userGroupsId = UserGroupId(userId = userId, groupId = group.groupsId),
            user = mockk(),
            group = group
        )
        teacher.userGroups = setOf(userGroup)

        user = Users(
            userId = userId,
            indexNumber = 123,
            nick = "testUser",
            firstName = "Test",
            secondName = "User",
            role = UsersRoles.STUDENT,
            email = "",
            label = "User Label",
            userGroups = setOf(userGroup)
        )

        chest = Chests(
            chestId = chestId,
            chestType = "Test Chest",
            label = "Chest Label",
            edition = edition
        )

        subcategory = Subcategories(
            subcategoryName = "Test Subcategory",
            category = mockk<Categories>(),
            edition = edition,
            label = "Subcategory Label"
        )
    }

    @Test
    fun `should add chest to user successfully`() {

        every { usersRepository.findById(userId) } returns Optional.of(user)
        every { chestsRepository.findById(chestId) } returns Optional.of(chest)
        every { usersRepository.findById(teacherId) } returns Optional.of(teacher)
        every { subcategoriesRepository.findById(subcategoryId) } returns Optional.of(subcategory)
        every { chestHistoryRepository.save(any()) } answers { firstArg() }


        // Execute method under test
        val result = chestHistoryDataFetcher.addChestToUser(userId, chestId, teacherId, subcategoryId)

        // Validate results
        assertNotNull(result)
        assertEquals(user, result.user)
        assertEquals(teacher, result.teacher)
        assertEquals(chest, result.chest)
        assertEquals(subcategory, result.subcategory)

        // Verify repository interactions
        verify { chestHistoryRepository.save(any()) }
    }

    @Test
    fun `should throw exception when user is not found`() {
        every { usersRepository.findById(userId) } returns Optional.empty()

        assertThrows<IllegalArgumentException> {
            chestHistoryDataFetcher.addChestToUser(userId, chestId, teacherId, subcategoryId)
        }
    }

    @Test
    fun `should throw exception when user has no groups`() {
        val userWithoutGroups = mockk<Users> {
            every { userId } returns 2L
            every { userGroups } returns emptySet()
            every { role } returns UsersRoles.STUDENT
        }

        every { usersRepository.findById(userId) } returns Optional.of(userWithoutGroups)

        assertThrows<IllegalArgumentException> {
            chestHistoryDataFetcher.addChestToUser(userId, chestId, teacherId, subcategoryId)
        }
    }

    @Test
    fun `should throw exception when user is not a student`() {
        every { usersRepository.findById(userId) } returns Optional.of(user.apply { role = UsersRoles.TEACHER })

        assertThrows<IllegalArgumentException> {
            chestHistoryDataFetcher.addChestToUser(userId, chestId, teacherId, subcategoryId)
        }
    }

    @Test
    fun `should throw exception when chest edition has not started`() {
        val futureChest = mockk<Chests> {
            every { edition } returns mockk {
                every { startDate } returns LocalDate.now().plusDays(1)
                every { endDate } returns LocalDate.now().plusDays(10)
            }
        }

        every { usersRepository.findById(userId) } returns Optional.of(user)
        every { chestsRepository.findById(chestId) } returns Optional.of(futureChest)

        assertThrows<IllegalArgumentException> {
            chestHistoryDataFetcher.addChestToUser(userId, chestId, teacherId, subcategoryId)
        }
    }

    @Test
    fun `should throw exception when chest edition has already ended`() {
        val pastChest = mockk<Chests> {
            every { edition } returns mockk {
                every { startDate } returns LocalDate.now().minusDays(10)
                every { endDate } returns LocalDate.now().minusDays(1)
            }
        }

        every { usersRepository.findById(userId) } returns Optional.of(user)
        every { chestsRepository.findById(chestId) } returns Optional.of(pastChest)

        assertThrows<IllegalArgumentException> {
            chestHistoryDataFetcher.addChestToUser(userId, chestId, teacherId, subcategoryId)
        }
    }

    @Test
    fun `should throw exception when chest and user do not have the same edition`() {
        val differentEditionChest = mockk<Chests> {
            every { edition } returns mockk {
                every { editionId } returns 2L
                every { startDate } returns LocalDate.now().minusDays(10)
                every { endDate } returns LocalDate.now().plusDays(10)
            }
        }

        every { usersRepository.findById(userId) } returns Optional.of(user)
        every { chestsRepository.findById(chestId) } returns Optional.of(differentEditionChest)

        assertThrows<IllegalArgumentException> {
            chestHistoryDataFetcher.addChestToUser(userId, chestId, teacherId, subcategoryId)
        }
    }

    @Test
    fun `should throw exception when teacher is not found`() {
        every { usersRepository.findById(userId) } returns Optional.of(user)
        every { chestsRepository.findById(chestId) } returns Optional.of(chest)
        every { usersRepository.findById(teacherId) } returns Optional.empty()

        assertThrows<IllegalArgumentException> {
            chestHistoryDataFetcher.addChestToUser(userId, chestId, teacherId, subcategoryId)
        }
    }

    @Test
    fun `should throw exception when teacher is not a teacher or coordinator`() {
        val nonTeacher = mockk<Users> {
            every { role } returns UsersRoles.STUDENT
        }

        every { usersRepository.findById(userId) } returns Optional.of(user)
        every { chestsRepository.findById(chestId) } returns Optional.of(chest)
        every { usersRepository.findById(teacherId) } returns Optional.of(nonTeacher)

        assertThrows<IllegalArgumentException> {
            chestHistoryDataFetcher.addChestToUser(userId, chestId, teacherId, subcategoryId)
        }
    }

    @Test
    fun `should throw exception when subcategory and chest do not have the same edition`() {
        val mismatchedSubcategory = mockk<Subcategories> {
            every { edition } returns mockk {
                every { editionId } returns 2L
            }
        }

        every { usersRepository.findById(userId) } returns Optional.of(user)
        every { chestsRepository.findById(chestId) } returns Optional.of(chest)
        every { usersRepository.findById(teacherId) } returns Optional.of(teacher)
        every { subcategoriesRepository.findById(subcategoryId) } returns Optional.of(mismatchedSubcategory)

        assertThrows<IllegalArgumentException> {
            chestHistoryDataFetcher.addChestToUser(userId, chestId, teacherId, subcategoryId)
        }
    }
}
