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
import backend.graphql.utils.*
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

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

    @DgsQuery
    @Transactional
    fun listSetupChests(@InputArgument editionId: Long): List<ChestWithPermissions>{
        val arguments = mapOf("editionId" to editionId)
        val permissionInput = PermissionInput(
            action = "listSetupChests",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val chests = chestsRepository.findAll().map {
            ChestWithPermissions(
                chest = it,
                permissions = ListPermissionsOutput(
                    canAdd = Permission(
                        "addChest",
                        objectMapper.createObjectNode(),
                        false,
                        "Nie dotyczy"),
                    canEdit = permissionService.checkPartialPermission(PermissionInput("editChest", objectMapper.writeValueAsString(mapOf("chestId" to it.chestId)))),
                    canCopy = permissionService.checkPartialPermission(PermissionInput("copyChest", objectMapper.writeValueAsString(mapOf("chestId" to it.chestId)))),
                    canRemove = permissionService.checkPartialPermission(PermissionInput("removeChest", objectMapper.writeValueAsString(mapOf("chestId" to it.chestId)))),
                    canSelect = permissionService.checkPartialPermission(PermissionInput("addChestToEdition", objectMapper.writeValueAsString(mapOf("chestId" to it.chestId, "editionId" to editionId)))),
                    canUnselect = permissionService.checkPartialPermission(PermissionInput("removeChestFromEdition", objectMapper.writeValueAsString(mapOf("chestId" to it.chestId, "editionId" to editionId)))),
                    additional = emptyList(),
                    canActivate = permissionService.checkPartialPermission(PermissionInput("activateChestInEdition", objectMapper.writeValueAsString(mapOf("chestId" to it.chestId, "editionId" to editionId)))),
                    canDeactivate = permissionService.checkPartialPermission(PermissionInput("deactivateChestInEdition", objectMapper.writeValueAsString(mapOf("chestId" to it.chestId, "editionId" to editionId))))
                )
            )
        }

        return chests
    }

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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
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
            val award = awardRepository.findById(awardId).orElseThrow { IllegalArgumentException("Nie znaleziono Łupu o id $awardId") }
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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val chest = chestsRepository.findById(chestId).orElseThrow { IllegalArgumentException("Nie znaleziono skrzynki o id $chestId") }

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
            val award = awardRepository.findById(awardId).orElseThrow { IllegalArgumentException("Nie znaleziono Łupu o id $awardId") }
            chestAwardRepository.findByChestAndAward(chest, award)?.let {
                chestAwardRepository.delete(it)
            }
        }

        toAdd.forEach { awardId ->
            val award = awardRepository.findById(awardId).orElseThrow { IllegalArgumentException("Nie znaleziono Łupu o id $awardId") }
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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val chest = chestsRepository.findById(chestId).orElseThrow { IllegalArgumentException("Nie znaleziono skrzynki o id $chestId") }

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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val chest = chestsRepository.findById(chestId).orElseThrow { IllegalArgumentException("Nie znaleziono skrzynki o id $chestId") }

        val chestTypeRoot = chest.chestType
        var i = 1
        while (chestsRepository.findAllByChestType("$chestTypeRoot (Kopia $i)").isNotEmpty()) {
            i++
        }
        val chestType = "$chestTypeRoot (Kopia $i)"


        val newChest = Chests(
            chestType = chestType,
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

data class ChestWithPermissions(
    val chest: Chests,
    val permissions: ListPermissionsOutput
)
