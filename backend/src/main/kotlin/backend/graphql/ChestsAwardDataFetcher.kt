package backend.graphql

import backend.award.AwardRepository
import backend.bonuses.BonusesRepository
import backend.categories.CategoriesRepository
import backend.chestAward.ChestAward
import backend.chestAward.ChestAwardRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.Chests
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
class ChestsAwardDataFetcher {
    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    lateinit var usersRepository: UsersRepository

    @Autowired
    lateinit var pointsRepository: PointsRepository

    @Autowired
    lateinit var bonusesRepository: BonusesRepository

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
    lateinit var chestsRepository: ChestsRepository

    @Autowired
    lateinit var photoAssigner: PhotoAssigner

    @Autowired
    lateinit var awardRepository: AwardRepository

    @Autowired
    lateinit var chestAwardRepository: ChestAwardRepository

    @Autowired
    lateinit var chestHistoryRepository: ChestHistoryRepository

    @DgsMutation
    @Transactional
    fun addAwardToChest(@InputArgument awardId: Long, @InputArgument chestId: Long): ChestAward {
        val action = "addAwardToChest"
        val arguments = mapOf(
            "awardId" to awardId,
            "chestId" to chestId
        )

        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val award = awardRepository.findById(awardId).orElseThrow { throw IllegalArgumentException("Nie znaleziono Łupu o id $awardId") }
        val chest = chestsRepository.findById(chestId).orElseThrow { throw IllegalArgumentException("Nie znaleziono skrzynki o id $chestId") }

        val chestAward = ChestAward(
            award = award,
            chest = chest,
            label = ""
        )
        return chestAwardRepository.save(chestAward)
    }

    @DgsMutation
    @Transactional
    fun removeAwardFromChest(@InputArgument awardId: Long, @InputArgument chestId: Long): Boolean {
        val action = "removeAwardFromChest"
        val arguments = mapOf(
            "awardId" to awardId,
            "chestId" to chestId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val award = awardRepository.findById(awardId).orElseThrow { throw IllegalArgumentException("Nie znaleziono Łupu o id $awardId") }
        val chest = chestsRepository.findById(chestId).orElseThrow { throw IllegalArgumentException("Nie znaleziono skrzynki o id $chestId") }

        chestAwardRepository.deleteByAwardAndChest(award, chest)
        return true
    }
}
