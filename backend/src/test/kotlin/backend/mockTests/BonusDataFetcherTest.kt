import backend.award.Award
import backend.award.AwardRepository
import backend.award.AwardType
import backend.awardEdition.AwardEdition
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.Bonuses
import backend.bonuses.BonusesRepository
import backend.categories.Categories
import backend.chestHistory.ChestHistory
import backend.chestHistory.ChestHistoryRepository
import backend.chests.Chests
import backend.edition.Edition
import backend.graphql.BonusDataFetcher
import backend.groups.Groups
import backend.groups.GroupsRepository
import backend.points.Points
import backend.points.PointsRepository
import backend.subcategories.Subcategories
import backend.subcategories.SubcategoriesRepository
import backend.userGroups.UserGroupId
import backend.userGroups.UserGroups
import backend.users.Users
import backend.users.UsersRoles
import backend.utils.UserMapper
import backend.weekdays.Weekdays
import io.mockk.*
import io.mockk.junit5.MockKExtension
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.extension.ExtendWith
import java.math.BigDecimal
import java.sql.Time
import java.time.LocalDate
import java.util.*

@ExtendWith(MockKExtension::class)
class BonusDataFetcherTest {

    private lateinit var bonusDataFetcher: BonusDataFetcher

    private val userMapper = mockk<UserMapper>()
    private val bonusRepository = mockk<BonusesRepository>()
    private val pointsRepository = mockk<PointsRepository>()
    private val chestHistoryRepository = mockk<ChestHistoryRepository>()
    private val awardRepository = mockk<AwardRepository>()
    private val awardEditionRepository = mockk<AwardEditionRepository>()
    private val groupsRepository = mockk<GroupsRepository>()
    private val subcategoriesRepository = mockk<SubcategoriesRepository>()

    private lateinit var edition: Edition
    private lateinit var category: Categories
    private lateinit var subcategory: Subcategories
    private lateinit var user: Users
    private lateinit var teacher: Users
    private lateinit var chest: Chests
    private lateinit var chestHistory: ChestHistory
    private lateinit var award: Award
    private lateinit var weekday: Weekdays
    private lateinit var group: Groups
    private lateinit var userGroups: UserGroups
    private lateinit var points3Val: Points
    private lateinit var points5Val: Points
    private lateinit var points7Val: Points

    private val chestHistoryId: Long = 1L
    private val awardId: Long = 1L
    private val userId: Long = 1L
    private val editionId: Long = 1L

    @BeforeEach
    fun setUp() {
        bonusDataFetcher = BonusDataFetcher().apply {
            this.userMapper = this@BonusDataFetcherTest.userMapper
            this.bonusRepository = this@BonusDataFetcherTest.bonusRepository
            this.pointsRepository = this@BonusDataFetcherTest.pointsRepository
            this.chestHistoryRepository = this@BonusDataFetcherTest.chestHistoryRepository
            this.awardRepository = this@BonusDataFetcherTest.awardRepository
            this.awardEditionRepository = this@BonusDataFetcherTest.awardEditionRepository
            this.groupsRepository = this@BonusDataFetcherTest.groupsRepository
            this.subcategoriesRepository = this@BonusDataFetcherTest.subcategoriesRepository
        }

        edition = Edition(
            editionId = editionId,
            editionName = "Edition Name",
            editionYear = 2023,
            label = "Edition Label",
            startDate = LocalDate.now().minusDays(5),
            endDate = LocalDate.now().plusDays(5)
        )

        category = Categories(
            categoryName = "Test Category",
            canAddPoints = true,
            label = "Test Label",
            lightColor = "#FFFFFF",
            darkColor = "#000000"
        )

        award = Award(
            awardId = awardId,
            awardName = "Test Award",
            awardType = AwardType.ADDITIVE,
            awardValue = BigDecimal(10),
            category = category,
            maxUsages = 5,
            description = "Test Description",
            label = "Award Label"
        )

        subcategory = Subcategories(
            subcategoryId = 1L,
            subcategoryName = "Test Subcategory",
            maxPoints = BigDecimal(1),
            ordinalNumber = 1,
            category = category,
            edition = edition,
            label = "Test Label"
        )

        user = Users(
            userId = userId,
            indexNumber = 1,
            nick = "test",
            firstName = "Test",
            secondName = "User",
            role = UsersRoles.STUDENT,
            email = "test@test.com",
            label = "test"
        )

        teacher = Users(
            userId = 2L,
            indexNumber = 2,
            nick = "teacher",
            firstName = "Test",
            secondName = "Teacher",
            role = UsersRoles.TEACHER,
            email = "teacher@test.com",
            label = "teacher"
        )

        weekday = Weekdays(
            weekdayId = 1L,
            weekdayName = "Monday",
            weekdayAbbr = "M",
            label = "test"
        )

        chest = Chests(
            chestId = chestHistoryId,
            chestType = "Test Chest",
            label = "Test Chest Label",
            edition = edition
        )

        chestHistory = spyk(ChestHistory(
            chestHistoryId = chestHistoryId,
            user = user,
            teacher = teacher,
            chest = chest,
            subcategory = subcategory,
            label = "Test Chest History"
        ))

        group = Groups(
            groupsId = 1L,
            groupName = "Test Group",
            generatedName = "Generated Group",
            usosId = 1001,
            label = "Group Label",
            teacher = teacher,
            weekday = weekday,
            startTime = Time.valueOf("09:00:00"),
            endTime = Time.valueOf("10:00:00"),
            edition = edition
        )

        userGroups = UserGroups(
            userGroupsId = UserGroupId(userId = user.userId, groupId = group.groupsId),
            user = user,
            group = group
        )

        points3Val = Points(
            student = user,
            teacher = teacher,
            updatedBy = teacher,
            value = BigDecimal(3),
            subcategory = subcategory,
            label = ""
        )

        points5Val = Points(
            student = user,
            teacher = teacher,
            updatedBy = teacher,
            value = BigDecimal(5),
            subcategory = subcategory,
            label = ""
        )

        points7Val = Points(
            student = user,
            teacher = teacher,
            updatedBy = teacher,
            value = BigDecimal(7),
            subcategory = subcategory,
            label = ""
        )



        group.userGroups = setOf(userGroups)
        every { userMapper.getCurrentUser() } returns user
        every { chestHistoryRepository.findById(chestHistoryId) } returns Optional.of(chestHistory)
        every { chestHistory.hasExistingBonus(any()) } returns false
        every { awardRepository.findById(awardId) } returns Optional.of(award)
        every { user.getAwardUsageCount(award, bonusRepository) } returns 0
        every { groupsRepository.findByUserGroups_User_UserId(user.userId) } returns listOf(group)
        every { awardEditionRepository.findByAward(award) } returns listOf(AwardEdition(award = award, edition = edition, label = "Label"))
        every { pointsRepository.save(any<Points>()) } answers { firstArg() }
        every { bonusRepository.save(any<Bonuses>()) } answers { firstArg() }
        every { chestHistoryRepository.save(any<ChestHistory>()) } answers { firstArg() }
        every {pointsRepository.findAllByStudentAndSubcategory_Edition(any(), any())} returns emptyList()
        every {subcategoriesRepository.findFirstByCategoryAndEditionAndOrdinalNumberGreaterThanOrderByOrdinalNumberAsc(any(), any(), any())} returns Optional.of(subcategory)
        every {subcategoriesRepository.findFirstByCategoryOrderByOrdinalNumberAsc(any())}  returns Optional.of(subcategory)
        every {subcategoriesRepository.findFirstByCategoryAndEditionOrderByOrdinalNumberAsc(any(), any())}  returns Optional.of(subcategory)
    }

    @Test
    fun `addBonusMutation should add bonus when data is valid - additive`() {
        val result = bonusDataFetcher.addBonusMutation(chestHistoryId, awardId, checkDates = false)

        assertNotNull(result)
        assertNotNull(result.bonus)
        assertNotNull(result.points)
        assertEquals(BigDecimal(10), result.points.value)
        assertTrue(chestHistory.opened)

        verify { chestHistoryRepository.findById(chestHistoryId) }
        verify { awardRepository.findById(awardId) }
        verify { bonusRepository.save(any()) }
        verify { pointsRepository.save(any()) }
        verify { chestHistoryRepository.save(chestHistory) }
        }
}