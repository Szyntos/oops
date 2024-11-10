package backend.graphql

import backend.award.AwardRepository
import backend.awardEdition.AwardEdition
import backend.bonuses.BonusesRepository
import backend.categories.CategoriesRepository
import backend.chestAward.ChestAward
import backend.chestAward.ChestAwardRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.Chests
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.permissions.PermissionDeniedException
import backend.graphql.permissions.PermissionInput
import backend.graphql.permissions.PermissionService
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

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
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val award = awardRepository.findById(awardId).orElseThrow { throw IllegalArgumentException("Award not found") }
        var chest = chestsRepository.findById(chestId).orElseThrow { throw IllegalArgumentException("Chest not found") }

        if (chestHistoryRepository.findByChest(chest).any { it.opened }){
            chest.active = false
            chestsRepository.save(chest)
            val newChest = Chests(
                chestType = chest.chestType,
                label = chest.label,
                awardBundleCount = chest.awardBundleCount
            )
            newChest.imageFile = chest.imageFile
            chestsRepository.save(newChest)
            chestAwardRepository.findByChest(chest).forEach {
                chestAwardRepository.save(
                    ChestAward(
                        award = it.award,
                        chest = newChest,
                        label = it.label
                    )
                )
            }
            chestHistoryRepository.findByChest(chest).filter { !it.opened }.forEach {
                it.chest = newChest
                chestHistoryRepository.save(it)
            }
            chest = newChest
        }


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
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val award = awardRepository.findById(awardId).orElseThrow { throw IllegalArgumentException("Award not found") }
        var chest = chestsRepository.findById(chestId).orElseThrow { throw IllegalArgumentException("Chest not found") }

        if (chestHistoryRepository.findByChest(chest).any { it.opened }){
            chest.active = false
            chestsRepository.save(chest)
            val newChest = Chests(
                chestType = chest.chestType,
                label = chest.label,
                awardBundleCount = chest.awardBundleCount
            )
            newChest.imageFile = chest.imageFile
            chestsRepository.save(newChest)
            chestAwardRepository.findByChest(chest).forEach {
                chestAwardRepository.save(
                    ChestAward(
                        award = it.award,
                        chest = newChest,
                        label = it.label
                    )
                )
            }
            chestHistoryRepository.findByChest(chest).filter { !it.opened }.forEach {
                it.chest = newChest
                chestHistoryRepository.save(it)
            }
            chest = newChest
        }

        chestAwardRepository.deleteByAwardAndChest(award, chest)
        return true
    }
}
