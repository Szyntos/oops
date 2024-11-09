package backend.graphql

import backend.award.AwardRepository
import backend.awardEdition.AwardEdition
import backend.awardEdition.AwardEditionRepository
import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEdition
import backend.categoryEdition.CategoryEditionRepository
import backend.chestAward.ChestAwardRepository
import backend.chestEdition.ChestEdition
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.Chests
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.graphql.permissions.PermissionInput
import backend.graphql.permissions.PermissionService
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class ChestEditionDataFetcher {

    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var awardEditionRepository: AwardEditionRepository

    @Autowired
    private lateinit var chestHistoryRepository: ChestHistoryRepository

    @Autowired
    private lateinit var chestAwardRepository: ChestAwardRepository

    @Autowired
    private lateinit var chestEditionRepository: ChestEditionRepository

    @Autowired
    private lateinit var chestsRepository: ChestsRepository

    @Autowired
    private lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var categoryEditionRepository: CategoryEditionRepository

    @Autowired
    lateinit var editionRepository: EditionRepository

    @Autowired
    lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    lateinit var subcategoriesDataFetcher: SubcategoriesDataFetcher

    @DgsMutation
    @Transactional
    fun addChestToEdition(@InputArgument chestId: Long, @InputArgument editionId: Long): ChestEdition {
        val action = "addChestToEdition"
        val arguments = mapOf(
            "chestId" to chestId,
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason)
        }

        val chest = chestsRepository.findById(chestId).orElseThrow { throw IllegalArgumentException("Chest not found") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Edition not found") }

        val chestEdition = ChestEdition(
            chest = chest,
            edition = edition,
            label = ""
        )

        val resultChestEdition = chestEditionRepository.save(chestEdition)


        return resultChestEdition
    }

    @DgsMutation
    @Transactional
    fun removeChestFromEdition(@InputArgument chestId: Long, @InputArgument editionId: Long): Boolean {
        val action = "removeChestFromEdition"
        val arguments = mapOf(
            "chestId" to chestId,
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason)
        }

        val chest = chestsRepository.findById(chestId).orElseThrow { throw IllegalArgumentException("Chest not found") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Edition not found") }

        chestEditionRepository.deleteByChestAndEdition(chest, edition)
        return true
    }
}
