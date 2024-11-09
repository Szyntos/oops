package backend.graphql

import backend.award.AwardRepository
import backend.awardEdition.AwardEditionRepository
import backend.categories.CategoriesRepository
import backend.chestAward.ChestAward
import backend.chestAward.ChestAwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.Chests
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.groups.GroupsRepository
import backend.graphql.permissions.PermissionInput
import backend.graphql.permissions.PermissionService
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@DgsComponent
class ChestsDataFetcher {
    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var chestEditionRepository: ChestEditionRepository

    @Autowired
    private lateinit var chestHistoryRepository: ChestHistoryRepository

    @Autowired
    private lateinit var awardRepository: AwardRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var chestAwardRepository: ChestAwardRepository

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
    lateinit var chestsRepository: ChestsRepository

    @Autowired
    lateinit var awardEditionRepository: AwardEditionRepository

    @Autowired
    lateinit var photoAssigner: PhotoAssigner

    @DgsMutation
    @Transactional
    fun assignPhotoToChest(@InputArgument chestId: Long, @InputArgument fileId: Long?): Boolean {
        val arguments = mapOf("chestId" to chestId, "fileId" to fileId)
        val permissionInput = PermissionInput(
            action = "assignPhotoToChest",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }


        return photoAssigner.assignPhotoToAssignee(chestsRepository, "image/chest", chestId, fileId)
    }

    @DgsMutation
    @Transactional
    fun addChest(@InputArgument chestType: String,
                 @InputArgument fileId: Long?,
                 @InputArgument awardBundleCount: Int,
                 @InputArgument label: String = "",
                 @InputArgument awardIds: List<Long>): Chests {
        val arguments = mapOf(
            "chestType" to chestType,
            "fileId" to fileId,
            "awardBundleCount" to awardBundleCount,
            "label" to label,
            "awardIds" to awardIds
        )
        val permissionInput = PermissionInput(
            action = "addChest",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }

        val chest = Chests(
            chestType = chestType,
            label = label,
            awardBundleCount = awardBundleCount
        )
        val savedChest = chestsRepository.save(chest)
        fileId?.let {
            photoAssigner.assignPhotoToAssignee(chestsRepository, "image/chest", savedChest.chestId, fileId)
        }

        awardIds.forEach { awardId ->
            val award = awardRepository.findById(awardId).orElseThrow { IllegalArgumentException("Invalid award ID") }
            val chestAward = ChestAward(
                chest = savedChest,
                award = award,
                label = ""
            )
            chestAwardRepository.save(chestAward)
        }

        return savedChest
    }

    @DgsMutation
    @Transactional
    fun editChest(
        @InputArgument chestId: Long,
        @InputArgument chestType: String?,
        @InputArgument fileId: Long?,
        @InputArgument awardBundleCount: Int?,
        @InputArgument label: String?,
        @InputArgument awardIds: List<Long>
    ): Chests {
        val arguments = mapOf(
            "chestId" to chestId,
            "chestType" to chestType,
            "fileId" to fileId,
            "awardBundleCount" to awardBundleCount,
            "label" to label,
            "awardIds" to awardIds
        )
        val permissionInput = PermissionInput(
            action = "editChest",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }

        var chest = chestsRepository.findById(chestId).orElseThrow { IllegalArgumentException("Invalid chest ID") }

        chestType?.let {
            chest.chestType = it
        }

        fileId?.let {
            photoAssigner.assignPhotoToAssignee(chestsRepository, "image/chest", chestId, fileId)
        }

        label?.let {
            chest.label = it
        }

        awardBundleCount?.let {
            chest.awardBundleCount = it
        }

        val newAwardIds = awardIds.toSet()

        val oldAwardIds = chestAwardRepository.findByChest(chest).map { it.award.awardId }.toSet()

        val toRemove = oldAwardIds.minus(newAwardIds)

        val toAdd = newAwardIds.minus(oldAwardIds)

        toRemove.forEach { awardId ->
            val award = awardRepository.findById(awardId).orElseThrow { IllegalArgumentException("Invalid award ID") }
            if (chestHistoryRepository.findByChest(chest).any { it.opened }) {
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
            chestAwardRepository.findByChestAndAward(chest, award)?.let {
                chestAwardRepository.delete(it)
            }
        }

        toAdd.forEach { awardId ->
            val award = awardRepository.findById(awardId).orElseThrow { IllegalArgumentException("Invalid award ID") }
            if (chestHistoryRepository.findByChest(chest).any { it.opened }) {
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
                chest = chest,
                award = award,
                label = ""
            )
            chestAwardRepository.save(chestAward)
        }

        return chestsRepository.save(chest)
    }

    @DgsMutation
    @Transactional
    fun removeChest(@InputArgument chestId: Long): Boolean {
        val arguments = mapOf(
            "chestId" to chestId
        )
        val permissionInput = PermissionInput(
            action = "removeChest",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }

        val chest = chestsRepository.findById(chestId).orElseThrow { IllegalArgumentException("Invalid chest ID") }

        chestEditionRepository.deleteByChest(chest)
        chestAwardRepository.findByChest(chest).forEach {
            chestAwardRepository.delete(it)
        }

        chestsRepository.delete(chest)
        return true
    }

    @DgsMutation
    @Transactional
    fun copyChest(@InputArgument chestId: Long): Chests {
        val arguments = mapOf(
            "chestId" to chestId
        )
        val permissionInput = PermissionInput(
            action = "copyChest",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }

        val chest = chestsRepository.findById(chestId).orElseThrow { IllegalArgumentException("Invalid chest ID") }
        val newChest = Chests(
            chestType = chest.chestType,
            label = chest.label,
            awardBundleCount = chest.awardBundleCount
        )
        newChest.imageFile = chest.imageFile
        chestsRepository.save(newChest)
        chestAwardRepository.findByChest(chest).forEach { chestAward ->
            val newChestAward = ChestAward(
                chest = newChest,
                award = chestAward.award,
                label = ""
            )
            chestAwardRepository.save(newChestAward)
        }
        return chestsRepository.save(newChest)
    }
}
