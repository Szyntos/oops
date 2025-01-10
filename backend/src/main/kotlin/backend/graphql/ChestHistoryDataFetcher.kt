package backend.graphql

import backend.award.AwardRepository
import backend.bonuses.BonusesRepository
import backend.categories.CategoriesRepository
import backend.chestHistory.ChestHistory
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.PermissionDeniedException
import backend.graphql.utils.PermissionInput
import backend.graphql.utils.PermissionService
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class ChestHistoryDataFetcher {
    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var bonusesRepository: BonusesRepository

    @Autowired
    lateinit var usersRepository: UsersRepository

    @Autowired
    lateinit var pointsRepository: PointsRepository

    @Autowired
    lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    lateinit var groupsRepository: GroupsRepository

    @Autowired
    lateinit var editionRepository: EditionRepository

    @Autowired
    lateinit var fileEntityRepository: FileEntityRepository

    @Autowired
    lateinit var awardRepository: AwardRepository

    @Autowired
    lateinit var photoAssigner: PhotoAssigner

    @Autowired
    private lateinit var chestsRepository: ChestsRepository

    @Autowired
    private lateinit var chestHistoryRepository: ChestHistoryRepository

    @DgsMutation
    @Transactional
    fun addChestToUser(@InputArgument userId: Long, @InputArgument chestId: Long, @InputArgument teacherId: Long,
                       @InputArgument subcategoryId: Long): ChestHistory {
        val action = "addChestToUser"
        val arguments = mapOf(
            "userId" to userId,
            "chestId" to chestId,
            "teacherId" to teacherId,
            "subcategoryId" to subcategoryId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val user = usersRepository.findById(userId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono użytkownika o id $userId") }

        val chest = chestsRepository.findById(chestId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono skrzynki o id $chestId") }

        val teacher = usersRepository.findById(teacherId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono nauczyciela o id $teacherId") }

        val subcategory = subcategoriesRepository.findById(subcategoryId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono podkategorii o id $subcategoryId") }


        val chestHistory = ChestHistory(
            user = user,
            teacher = teacher,
            chest = chest,
            subcategory = subcategory,
            label = chest.label)

        chestHistoryRepository.save(chestHistory)

        return chestHistory
    }



    @DgsMutation
    @Transactional
    fun editChestHistory(
        @InputArgument chestHistoryId: Long,
        @InputArgument userId: Long?,
        @InputArgument chestId: Long?,
        @InputArgument teacherId: Long?,
        @InputArgument subcategoryId: Long?,
        @InputArgument label: String?
    ): ChestHistory {
        val action = "editChestHistory"
        val arguments = mapOf(
            "chestHistoryId" to chestHistoryId,
            "userId" to userId,
            "chestId" to chestId,
            "teacherId" to teacherId,
            "subcategoryId" to subcategoryId,
            "label" to label
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val chestHistory = chestHistoryRepository.findById(chestHistoryId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono chestHistory o id $chestHistoryId") }

        userId?.let { id ->
            val user = usersRepository.findById(id)
                .orElseThrow { IllegalArgumentException("Nie znaleziono użytkownika o id $userId") }
            chestHistory.user = user
        }

        chestId?.let { newChestId ->
            val chest = chestsRepository.findById(newChestId)
                .orElseThrow { IllegalArgumentException("Nie znaleziono skrzynki o id $chestId") }
            chestHistory.chest = chest
        }

        teacherId?.let {
            val teacher = usersRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Nie znaleziono nauczyciela o id $teacherId") }
            chestHistory.teacher = teacher
        }

        subcategoryId?.let { newSubcategoryId ->
            val subcategory = subcategoriesRepository.findById(newSubcategoryId)
                .orElseThrow { IllegalArgumentException("Nie znaleziono podkategorii o id $subcategoryId") }
            chestHistory.subcategory = subcategory
        }

        label?.let {
            chestHistory.label = it
        }

        return chestHistoryRepository.save(chestHistory)
    }

    @DgsMutation
    @Transactional
    fun removeChestFromUser(@InputArgument chestHistoryId: Long): Boolean {
        val action = "removeChestFromUser"

        val arguments = mapOf(
            "chestHistoryId" to chestHistoryId
        )

        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)

        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val chestHistory = chestHistoryRepository.findById(chestHistoryId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono chestHistory o id $chestHistoryId") }

        chestHistoryRepository.delete(chestHistory)
        return true
    }
}
