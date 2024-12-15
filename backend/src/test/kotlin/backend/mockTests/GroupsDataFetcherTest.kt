package backend.mockTests

import backend.groups.Groups
import backend.groups.GroupsRepository
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.GroupsDataFetcher
import backend.userGroups.UserGroupsRepository
import backend.users.Users
import backend.users.UsersRoles
import backend.users.UsersRepository
import backend.utils.UserMapper
import backend.weekdays.Weekdays
import backend.weekdays.WeekdaysRepository
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.sql.Time
import java.time.LocalDate
import java.util.*

class GroupsDataFetcherTest {

    private lateinit var groupsDataFetcher: GroupsDataFetcher
    private val groupsRepository: GroupsRepository = mockk()
    private val userGroupsRepository: UserGroupsRepository = mockk()
    private val editionRepository: EditionRepository = mockk()
    private val fileRepository: FileEntityRepository = mockk()
    private val usersRepository: UsersRepository = mockk()
    private val weekdaysRepository: WeekdaysRepository = mockk()

    private val editionId = 1L
    private val usosId = 1
    private val groupName = "Test Group"
    private val weekdayId = 1L
    private val startTime = Time.valueOf("10:00:00")
    private val endTime = Time.valueOf("11:00:00")
    private val teacherId = 1L
    private val label = "Group Label"

    private lateinit var edition: Edition
    private lateinit var weekday: Weekdays
    private lateinit var teacher: Users
    private lateinit var group: Groups

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
        groupsDataFetcher = GroupsDataFetcher().apply {
            this.groupsRepository = this@GroupsDataFetcherTest.groupsRepository
            this.editionRepository = this@GroupsDataFetcherTest.editionRepository
            this.fileRepository = this@GroupsDataFetcherTest.fileRepository
            this.usersRepository = this@GroupsDataFetcherTest.usersRepository
            this.weekdaysRepository = this@GroupsDataFetcherTest.weekdaysRepository
            this.userGroupsRepository = this@GroupsDataFetcherTest.userGroupsRepository
            this.userMapper = this@GroupsDataFetcherTest.userMapper
        }
        every {userMapper.getCurrentUser()} returns coordinator

        edition = Edition(
            editionId = editionId,
            editionName = "Edition Test",
            editionYear = 2023,
            label = "Edition Label",
            startDate = LocalDate.now().minusMonths(1),
            endDate = LocalDate.now().plusMonths(1)
        )

        weekday = Weekdays(
            weekdayId = weekdayId,
            weekdayName = "Monday",
            weekdayAbbr = "M",
            label = "test",
            ordinalNumber = 1
        )

        teacher = Users(
            userId = teacherId,
            indexNumber = 100,
            nick = "teacher",
            firstName = "Test",
            secondName = "Teacher",
            email = "",
            role = UsersRoles.TEACHER,
            label = "Teacher Label"
        )

        group = Groups(
            groupsId = 1L,
            groupName = groupName,
            generatedName = "",
            usosId = usosId,
            label = label,
            teacher = teacher,
            weekday = weekday,
            startTime = startTime,
            endTime = endTime,
            edition = edition
        )
    }

    @Test
    fun `should add group successfully`() {
        // Mock repository behaviors
        every { editionRepository.findById(editionId) } returns Optional.of(edition)
        every { groupsRepository.existsByGroupNameAndEdition(groupName, edition) } returns false
        every { groupsRepository.existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(teacher, weekday, startTime, endTime, edition) } returns false
        every { weekdaysRepository.findById(weekdayId) } returns Optional.of(weekday)
        every { usersRepository.findById(teacherId) } returns Optional.of(teacher)
        every { groupsRepository.save(any()) } answers { firstArg() }
        every { userGroupsRepository.save(any()) } answers { firstArg() }
        every {groupsRepository.existsByUsosIdAndEdition(any(), any())} returns false
        every { groupsRepository.findAllByGroupNameAndEdition(any(), any()) } returns emptyList()
        // Test the method
        val result = groupsDataFetcher.addGroup(editionId, usosId, weekdayId, startTime, endTime, teacherId, label, groupName)

        // Verify results
        assertNotNull(result)
        assertEquals(groupName, result.groupName)
        assertEquals(teacher, result.teacher)
        assertEquals(weekday, result.weekday)

        // Verify repository interactions
        verify { groupsRepository.save(any()) }
        verify { userGroupsRepository.save(any()) }
    }

    @Test
    fun `should assign photos to groups successfully`() {
        // Mock repository behaviors
        every { editionRepository.findById(editionId) } returns Optional.of(edition)
        every { groupsRepository.findByEdition(edition) } returns listOf(group)
        every { fileRepository.findAllByFileType("image/group") } returns listOf(mockk(), mockk())
        every { groupsRepository.save(any()) } answers { firstArg() }

        // Test the method
        val result = groupsDataFetcher.assignPhotosToGroups(editionId)

        // Verify results
        assertTrue(result)
        verify { groupsRepository.save(any()) }
    }

    @Test
    fun `should throw exception when edition has already ended while assigning photos`() {
        // Mock repository behaviors for expired edition
        val expiredEdition = mockk<Edition> {
            every { endDate } returns LocalDate.now().minusDays(1)
        }
        every { editionRepository.findById(editionId) } returns Optional.of(expiredEdition)

        // Test the method and verify exception
        assertThrows<IllegalArgumentException> {
            groupsDataFetcher.assignPhotosToGroups(editionId)
        }
    }

    @Test
    fun `should throw exception when group name already exists`() {
        // Mock repository behaviors
        every { editionRepository.findById(editionId) } returns Optional.of(edition)
        every { groupsRepository.existsByGroupNameAndEdition(groupName, edition) } returns true

        every { groupsRepository.existsByUsosIdAndEdition(any(), any()) } returns false
        every { groupsRepository.findAllByGroupNameAndEdition(any(), any()) } returns emptyList()
        every {weekdaysRepository.findById(any())} returns Optional.of(weekday)
        every {usersRepository.findById(any())} returns Optional.of(teacher)
        every {groupsRepository.existsByTeacherAndWeekdayAndStartTimeAndEndTimeAndEdition(any(), any(), any(), any(), any())} returns true

        // Test the method and verify exception
        assertThrows<IllegalArgumentException> {
            groupsDataFetcher.addGroup(editionId, usosId, weekdayId, startTime, endTime, teacherId, label, groupName)
        }
    }

    @Test
    fun `should throw exception when start time is after end time`() {
        // Mock repository behaviors
        every { editionRepository.findById(editionId) } returns Optional.of(edition)
        every { groupsRepository.existsByGroupNameAndEdition(groupName, edition) } returns false

        every { groupsRepository.existsByUsosIdAndEdition(any(), any()) } returns false
        every { groupsRepository.findAllByGroupNameAndEdition(any(), any()) } returns emptyList()

        // Test the method and verify exception
        assertThrows<IllegalArgumentException> {
            groupsDataFetcher.addGroup(editionId, usosId, weekdayId, Time.valueOf("12:00:00"), Time.valueOf("11:00:00"), teacherId, label, groupName)
        }
    }

    @Test
    fun `should throw exception when teacher is not found`() {
        // Mock repository behaviors
        every { editionRepository.findById(editionId) } returns Optional.of(edition)
        every { weekdaysRepository.findById(weekdayId) } returns Optional.of(weekday)
        every { usersRepository.findById(teacherId) } returns Optional.empty()  // Ensure this returns Optional.empty()

        // Ensure this method is mocked as it's called in the addGroup method
        every { groupsRepository.existsByUsosIdAndEdition(any(), any()) } returns false
        every { groupsRepository.findAllByGroupNameAndEdition(any(), any()) } returns emptyList()

        // Test the method and verify exception
        val exception = assertThrows<IllegalArgumentException> {
            groupsDataFetcher.addGroup(editionId, usosId, weekdayId, startTime, endTime, teacherId, label, groupName)
        }

        assertEquals("Invalid teacher ID", exception.message)  // Ensure the exception message matches what your code throws
    }



}
