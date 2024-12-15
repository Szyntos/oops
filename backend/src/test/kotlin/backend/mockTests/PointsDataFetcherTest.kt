import backend.points.Points
import backend.points.PointsRepository
import backend.bonuses.BonusesRepository
import backend.edition.Edition
import backend.graphql.PointsDataFetcher
import backend.groups.Groups
import backend.subcategories.Subcategories
import backend.subcategories.SubcategoriesRepository
import backend.userGroups.UserGroupId
import backend.userGroups.UserGroups
import backend.users.Users
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import backend.weekdays.Weekdays
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import io.mockk.verifyOrder
import org.junit.jupiter.api.*
import org.junit.jupiter.api.Assertions.*
import java.math.BigDecimal
import java.sql.Time
import java.time.LocalDate
import java.util.*

class PointsDataFetcherTest {

    private lateinit var pointsDataFetcher: PointsDataFetcher

    private val userMapper = mockk<UserMapper>(relaxed = true)
    private val pointsRepository = mockk<PointsRepository>(relaxed = true)
    private val bonusRepository = mockk<BonusesRepository>(relaxed = true)
    private val subcategoriesRepository = mockk<SubcategoriesRepository>(relaxed = true)
    private val usersRepository = mockk<UsersRepository>(relaxed = true)

    private val teacher = mockk<Users>(relaxed = true)
    private val student = mockk<Users>(relaxed = true)
    private val subcategory = mockk<Subcategories>(relaxed = true)
    private val edition = mockk<Edition>(relaxed = true)
    private val group = mockk<Groups>(relaxed = true)
    private val userGroups = mockk<UserGroups>(relaxed = true)

    @BeforeEach
    fun setup() {
        pointsDataFetcher = PointsDataFetcher().apply {
            this.userMapper = this@PointsDataFetcherTest.userMapper
            this.pointsRepository = this@PointsDataFetcherTest.pointsRepository
            this.bonusRepository = this@PointsDataFetcherTest.bonusRepository
            this.subcategoriesRepository = this@PointsDataFetcherTest.subcategoriesRepository
            this.usersRepository = this@PointsDataFetcherTest.usersRepository
        }

        val mockPoints = Points(
            student = student,
            teacher = teacher,
            updatedBy = teacher,
            value = BigDecimal(10),
            subcategory = subcategory,
            label = ""
        )

        every { pointsRepository.save(any<Points>()) } returns mockPoints
        every { pointsRepository.findById(1L) } returns Optional.of(mockPoints)
        every { userMapper.getCurrentUser() } returns teacher
        every { teacher.userId } returns 2L
        every { teacher.role } returns UsersRoles.TEACHER
        every { teacher.userGroups } returns setOf(userGroups)

        every { student.userId } returns 1L
        every { student.role } returns UsersRoles.STUDENT
        every { student.userGroups } returns setOf(userGroups)

        every { group.groupsId } returns 1L
        every { group.teacher } returns teacher
        every { group.edition } returns edition
        every { userGroups.user } returns student
        every { userGroups.group } returns group

        every { subcategory.edition } returns edition
        every { edition.startDate } returns LocalDate.now().minusDays(5)
        every { edition.endDate } returns LocalDate.now().plusDays(5)
    }

    @Test
    fun `addPointsMutation should add points when valid`() {
        every { usersRepository.findByUserId(1L) } returns Optional.of(student)
        every { usersRepository.findByUserId(2L) } returns Optional.of(teacher)
        every { subcategoriesRepository.findById(1L) } returns Optional.of(subcategory)
        every {subcategory.maxPoints} returns BigDecimal(50)
        every {subcategory.category.canAddPoints} returns true
        every {subcategory.edition} returns edition
        every {student.userGroups } returns setOf(userGroups)
        every {teacher.userGroups } returns setOf(userGroups)
        every {subcategory.edition} returns edition

        val points = pointsDataFetcher.addPointsMutation(
            studentId = 1L,
            teacherId = 2L,
            value = 10.0f,
            subcategoryId = 1L,
            checkDates = false
        )

        assertNotNull(points)
        verifyOrder {
            userMapper.getCurrentUser()
            usersRepository.findByUserId(1L)
            usersRepository.findByUserId(2L)
            subcategoriesRepository.findById(1L)
            pointsRepository.save(any())
        }
    }

    @Test
    fun `removePoints should delete points when no bonuses are attached`() {
        val points = Points(
            student = student,
            teacher = teacher,
            updatedBy = teacher,
            value = BigDecimal(10),
            subcategory = subcategory,
            label = ""
        )
        every { pointsRepository.findById(1L) } returns Optional.of(points)
        every { bonusRepository.findByPoints(points) } returns emptyList()

        val result = pointsDataFetcher.removePoints(pointsId = 1L)

        assertTrue(result)
        verify { pointsRepository.delete(points) }
    }

    @Test
    fun `addPointsMutation should throw error when teacher is not authorized`() {
        every { userMapper.getCurrentUser() } returns student

        val exception = assertThrows<IllegalArgumentException> {
            pointsDataFetcher.addPointsMutation(
                studentId = 1L,
                teacherId = 2L,
                value = 10.0f,
                subcategoryId = 1L,
                checkDates = false
            )
        }

        assertEquals("Only teachers and coordinators can add points", exception.message)
    }
}

//TODO: add editPoints but i am sick of testing it right now
