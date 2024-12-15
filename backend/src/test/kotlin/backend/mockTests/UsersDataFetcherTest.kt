import backend.bonuses.BonusesRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEdition
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.files.FileEntity
import backend.files.FileEntityRepository
import backend.files.FileRetrievalService
import backend.graphql.UsersDataFetcher
import backend.groups.Groups
import backend.groups.GroupsRepository
import backend.points.Points
import backend.points.PointsRepository
import backend.subcategories.Subcategories
import backend.subcategories.SubcategoriesRepository
import backend.userGroups.UserGroupId
import backend.userGroups.UserGroups
import backend.userGroups.UserGroupsRepository
import backend.userLevel.UserLevelRepository
import backend.users.FirebaseUserService
import backend.users.Users
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.CsvReader
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
class UsersDataFetcherTest {

    private lateinit var usersDataFetcher: UsersDataFetcher

    private val fileRetrievalService = mockk<FileRetrievalService>()
    private val userMapper = mockk<UserMapper>()
    private val usersRepository = mockk<UsersRepository>()
    private val groupsRepository = mockk<GroupsRepository>()
    private val editionRepository = mockk<EditionRepository>()
    private val fileEntityRepository = mockk<FileEntityRepository>()
    private val userGroupsRepository = mockk<UserGroupsRepository>()
    private val pointsRepository = mockk<PointsRepository>()
    private val categoriesRepository = mockk<CategoriesRepository>()
    private val firebaseUserService = mockk<FirebaseUserService>()
    private val csvReader = mockk<CsvReader>()
    private val bonusesRepository = mockk<BonusesRepository>()
    private val userLevelRepository = mockk<UserLevelRepository>()
    private val userId = 1L

    private val  edition = Edition(
        editionId = 1L,
        editionName = "Edition Name",
        editionYear = 2023,
        label = "Edition Label",
        startDate = LocalDate.now().minusDays(5),
        endDate = LocalDate.now().plusDays(5)
    )


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

    private val teacher = Users(
        userId = 3L,
        indexNumber = 2,
        nick = "teacher",
        firstName = "Test",
        secondName = "Teacher",
        role = UsersRoles.TEACHER,
        email = "teacher@test.com",
        label = "teacher"
    )

    private val user = Users(
        userId = 1L,
        indexNumber = 1,
        nick = "test_nick",
        firstName = "Test",
        secondName = "User",
        role = UsersRoles.STUDENT,
        email = "test@test.com",
        label = "test"
    )

    private val group = Groups(
        groupsId = 1L,
        groupName = "Test Group",
        generatedName = "Generated Group",
        usosId = 1001,
        label = "Group Label",
        teacher = teacher,
        weekday = mockk<Weekdays>(),
        startTime = Time.valueOf("09:00:00"),
        endTime = Time.valueOf("10:00:00"),
        edition = edition
    )

    private val userGroups = UserGroups(
        userGroupsId = UserGroupId(userId = user.userId, groupId = group.groupsId),
        user = user,
        group = group
    )



    @BeforeEach
    fun setup() {
        usersDataFetcher = UsersDataFetcher(fileRetrievalService).apply {
            this.userMapper = this@UsersDataFetcherTest.userMapper
            this.usersRepository = this@UsersDataFetcherTest.usersRepository
            this.groupsRepository = this@UsersDataFetcherTest.groupsRepository
            this.editionRepository = this@UsersDataFetcherTest.editionRepository
            this.fileEntityRepository = this@UsersDataFetcherTest.fileEntityRepository
            this.userGroupsRepository = this@UsersDataFetcherTest.userGroupsRepository
            this.pointsRepository = this@UsersDataFetcherTest.pointsRepository
            this.categoriesRepository = this@UsersDataFetcherTest.categoriesRepository
            this.firebaseUserService = this@UsersDataFetcherTest.firebaseUserService
            this.csvReader = this@UsersDataFetcherTest.csvReader
            this.bonusesRepository = this@UsersDataFetcherTest.bonusesRepository
            this.userLevelRepository = this@UsersDataFetcherTest.userLevelRepository
        }
        every { userMapper.getCurrentUser() } returns coordinator
        group.userGroups = setOf(userGroups)
        user.userGroups = setOf(userGroups)
    }

    @Test
    fun `addUser should add a new user with valid details`() {
        every { usersRepository.existsByIndexNumber(any()) } returns false
        every { usersRepository.findByNick(any()) } returns null
        every { usersRepository.save(any()) } answers { firstArg() }
        every {usersRepository.existsByEmail(any()) } returns false

        val newUser = usersDataFetcher.addUser(
            indexNumber = 101,
            nick = "newUser",
            firstName = "New",
            secondName = "User",
            role = "STUDENT",
            email = "newuser@test.com",
            label = "New User Label",
            createFirebaseUser = false,
            sendEmail = false
        )

        assertNotNull(newUser)
        assertEquals("newUser", newUser.nick)
        assertEquals("New", newUser.firstName)
        assertEquals(UsersRoles.STUDENT, newUser.role)
    }

    @Test
    fun `addUsersFromCsv should process and add users from a CSV file`() {
        val fileId = 100L
        val editionId = 1L
        val fileEntity = FileEntity(fileId = fileId, pathToFile = "/data", fileName = "shrek", fileType = "text/csv", label = "")

        every { fileEntityRepository.findById(fileId) } returns Optional.of(fileEntity)
        every { editionRepository.findById(editionId) } returns Optional.of(group.edition)
        every { csvReader.getUsersFromCsv(any()) } returns listOf(user)
        every { usersRepository.existsByIndexNumber(any()) } returns false
        every { usersRepository.findByNick(any()) } returns null
        every { userGroupsRepository.existsByUserAndGroup(any(), any()) } returns false
        every { usersRepository.save(any()) } answers { firstArg() }
        every { userGroupsRepository.save(any()) } answers { firstArg() }
        every { fileRetrievalService.deleteFile(fileId) } just Runs
        every {csvReader.extractGroupNumber(any())} returns 1
        every {groupsRepository.findByUsosIdAndEdition(any(), any())} returns group
        every {usersRepository.existsByEmail(any())} returns false
        every {firebaseUserService.createFirebaseUser(any(), any())} returns ""

        val addedUsers = usersDataFetcher.addUsersFromCsv(fileId, editionId)

        assertEquals(1, addedUsers.size)
        assertEquals("test_nick", addedUsers[0].nick)
        verify { fileRetrievalService.deleteFile(fileId) }
    }

    @Test
    fun `editUser should edit user details when valid input is provided`() {
        every {usersRepository.existsByIndexNumber(any()) } returns false
        every {usersRepository.findByNick(any()) } returns null
        every { usersRepository.findById(userId) } returns Optional.of(user)
        every { usersRepository.save(user) } answers { firstArg() }

        val editedUser = usersDataFetcher.editUser(
            userId = userId,
            indexNumber = 101,
            nick = "newNick",
            firstName = "New",
            secondName = "User",
            role = "STUDENT",
            label = "Updated Label"
        )

        assertEquals("newNick", editedUser.nick)
        assertEquals("New", editedUser.firstName)
    }

    @Test
    fun `removeUser should delete a user when they are not part of a group`() {
        every { usersRepository.findById(userId) } returns Optional.of(user)
        every { userGroupsRepository.existsByUserAndGroup(any(), any()) } returns false
        every {userLevelRepository.deleteAllByUser_UserId(any())} just Runs
        every {firebaseUserService.deleteFirebaseUser(any())} just Runs
        every { usersRepository.delete(user) } just Runs

        user.userGroups = emptySet()

        val result = usersDataFetcher.removeUser(userId)

        assertTrue(result)
        verify { usersRepository.delete(user) }
    }

    @Test
    fun `resetPassword should reset password when user exists`() {
        every { usersRepository.findByUserId(userId) } returns Optional.of(user)
        every { firebaseUserService.resetPassword(user.email) } returns true

        val result = usersDataFetcher.resetPassword(userId)

        assertTrue(result)
        verify { firebaseUserService.resetPassword(user.email) }
    }

    @Test
    fun `getStudentPoints should retrieve points for a student in a valid edition`() {
        val studentId = 1L
        val editionId = 1L

        every { usersRepository.findById(studentId) } returns Optional.of(user)
        every { editionRepository.findById(editionId) } returns Optional.of(edition)
        every { pointsRepository.findAllByStudentAndSubcategory_Edition(user, edition) } returns listOf(
            Points(
                student = user,
                teacher = teacher,
                updatedBy = teacher,
                value = BigDecimal(3),
                subcategory = mockk<Subcategories>(),
                label = ""
            )
        )
        every {bonusesRepository.findByChestHistory_User_UserId(any())} returns emptyList()
        every {bonusesRepository.findByPoints(any())} returns emptyList()

        val result = usersDataFetcher.getStudentPoints(studentId, editionId)

        assertNotNull(result)
        assertEquals(1, result.subcategoryPoints.size)
        assertEquals(3.0f, result.sumOfPurePoints)
    }
}
