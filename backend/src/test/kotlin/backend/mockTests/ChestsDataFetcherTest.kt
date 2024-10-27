import backend.chests.Chests
import backend.chests.ChestsRepository
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.graphql.ChestsDataFetcher
import backend.graphql.PhotoAssigner
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
class ChestsDataFetcherTest {

    private lateinit var chestsDataFetcher: ChestsDataFetcher
    private val chestsRepository: ChestsRepository = mockk()
    private val editionRepository: EditionRepository = mockk()
    private val photoAssigner: PhotoAssigner = mockk()

    private val chestId = 1L
    private val fileId = 2L
    private val editionId = 1L
    private val chestType = "Test Chest"
    private val label = "Chest Label"

    private lateinit var edition: Edition
    private lateinit var chest: Chests

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
        chestsDataFetcher = ChestsDataFetcher().apply {
            this.chestsRepository = this@ChestsDataFetcherTest.chestsRepository
            this.editionRepository = this@ChestsDataFetcherTest.editionRepository
            this.photoAssigner = this@ChestsDataFetcherTest.photoAssigner
            this.userMapper = this@ChestsDataFetcherTest.userMapper
        }
        every {userMapper.getCurrentUser()} returns coordinator

        edition = Edition(
            editionId = editionId,
            editionName = "Test Edition",
            editionYear = 2023,
            label = "Edition Label",
            startDate = LocalDate.now().minusDays(10),
            endDate = LocalDate.now().plusDays(10)
        )

        chest = Chests(
            chestId = chestId,
            chestType = chestType,
            label = label,
            edition = edition
        )
    }

    @Test
    fun `should assign photo to chest successfully`() {
        every { chestsRepository.findById(chestId) } returns Optional.of(chest)
        every { photoAssigner.assignPhotoToAssignee(chestsRepository, "image/chest", chestId, fileId) } returns true

        val result = chestsDataFetcher.assignPhotoToChest(chestId, fileId)

        assertTrue(result)
        verify { photoAssigner.assignPhotoToAssignee(chestsRepository, "image/chest", chestId, fileId) }
    }

    @Test
    fun `should throw exception when chest edition has already ended while assigning photo`() {
        every { chestsRepository.findById(chestId) } returns Optional.of(
            Chests(
                chestId = chestId,
                chestType = "Test Chest",
                label = "Chest Label",
                edition = Edition(
                    editionId = 1L,
                    editionName = "Ended Edition",
                    editionYear = 2023,
                    label = "Edition Label",
                    startDate = LocalDate.now().minusDays(10),
                    endDate = LocalDate.now().minusDays(1) // Edition has ended
                )
            )
        )

        assertThrows<IllegalArgumentException> {
            chestsDataFetcher.assignPhotoToChest(chestId, fileId)
        }
    }

    @Test
    fun `should throw exception when edition has already ended while adding chest`() {
        every {chestsRepository.existsByChestTypeAndEditionAndActive(any(), any(), any())} returns false
        every { editionRepository.findById(editionId) } returns Optional.of(
            Edition(
                editionId = editionId,
                editionName = "Ended Edition",
                editionYear = 2023,
                label = "Edition Label",
                startDate = LocalDate.now().minusDays(10),
                endDate = LocalDate.now().minusDays(1) // Edition has ended
            )
        )
        every {chestsRepository.existsByChestTypeAndEdition(any(), any())} returns true

        assertThrows<IllegalArgumentException> {
            chestsDataFetcher.addChest(chestType, editionId, label)
        }
    }


    @Test
    fun `should add chest successfully`() {
        every {chestsRepository.existsByChestTypeAndEditionAndActive(any(), any(), any())} returns false
        every { editionRepository.findById(editionId) } returns Optional.of(edition)
        every { chestsRepository.existsByChestTypeAndEdition(chestType, edition) } returns false
        every { chestsRepository.save(any()) } answers { firstArg() }

        val result = chestsDataFetcher.addChest(chestType, editionId, label)

        assertNotNull(result)
        assertEquals(chestType, result.chestType)
        assertEquals(edition, result.edition)
        assertEquals(label, result.label)

        verify { chestsRepository.save(any()) }
    }

    @Test
    fun `should throw exception when chest with type already exists for edition`() {
        every {chestsRepository.existsByChestTypeAndEditionAndActive(any(), any(), any())} returns true
        every { editionRepository.findById(editionId) } returns Optional.of(edition)
        every { chestsRepository.existsByChestTypeAndEdition(chestType, edition) } returns true

        assertThrows<IllegalArgumentException> {
            chestsDataFetcher.addChest(chestType, editionId, label)
        }
    }

    @Test
    fun `should throw exception when edition is not found`() {
        every { editionRepository.findById(editionId) } returns Optional.empty()

        assertThrows<IllegalArgumentException> {
            chestsDataFetcher.addChest(chestType, editionId, label)
        }
    }

    @Test
    fun `should throw exception when chest is not found for assigning photo`() {
        every { chestsRepository.findById(chestId) } returns Optional.empty()

        assertThrows<IllegalArgumentException> {
            chestsDataFetcher.assignPhotoToChest(chestId, fileId)
        }
    }
}
