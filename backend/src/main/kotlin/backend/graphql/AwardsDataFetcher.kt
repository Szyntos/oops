package backend.graphql

import backend.award.Award
import backend.award.AwardRepository
import backend.award.AwardType
import backend.awardEdition.AwardEditionRepository
import backend.categories.CategoriesRepository
import backend.chestAward.ChestAwardRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.utils.*
import backend.groups.GroupsRepository
import backend.levelSet.LevelSet
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.RoundingMode

@DgsComponent
class AwardsDataFetcher {

    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var awardEditionRepository: AwardEditionRepository

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
    lateinit var awardRepository: AwardRepository

    @Autowired
    lateinit var photoAssigner: PhotoAssigner

    @DgsQuery
    @Transactional
    fun listSetupAwards(@InputArgument editionId: Long): List<AwardWithPermissions> {
        val arguments = mapOf("editionId" to editionId)
        val permissionInput = PermissionInput(
            action = "listSetupAwards",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val awards = awardRepository.findAll().map {
            AwardWithPermissions(
                award = it,
                permissions = ListPermissionsOutput(
                    canAdd = Permission(
                        "addAward",
                        objectMapper.createObjectNode(),
                        false,
                        "Not applicable"),
                    canEdit = permissionService.checkPartialPermission(PermissionInput("editAward", objectMapper.writeValueAsString(mapOf("awardId" to it.awardId)))),
                    canCopy = permissionService.checkPartialPermission(PermissionInput("copyAward", objectMapper.writeValueAsString(mapOf("awardId" to it.awardId)))),
                    canRemove = permissionService.checkPartialPermission(PermissionInput("removeAward", objectMapper.writeValueAsString(mapOf("awardId" to it.awardId)))),
                    canSelect = permissionService.checkPartialPermission(PermissionInput("addAwardToEdition", objectMapper.writeValueAsString(mapOf("awardId" to it.awardId, "editionId" to editionId)))),
                    canUnselect = permissionService.checkPartialPermission(PermissionInput("removeAwardFromEdition", objectMapper.writeValueAsString(mapOf("awardId" to it.awardId, "editionId" to editionId)))),
                    additional = emptyList()
                )
            )
        }.sortedBy { it.award.awardName }

        return awards
    }

    @DgsMutation
    @Transactional
    fun assignPhotoToAward(@InputArgument awardId: Long, @InputArgument fileId: Long?): Boolean {
        val arguments = mapOf("awardId" to awardId, "fileId" to fileId)
        val permissionInput = PermissionInput(
            action = "assignPhotoToAward",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }
        return photoAssigner.assignPhotoToAssignee(awardRepository, "image/award", awardId, fileId)
    }

    @DgsMutation
    @Transactional
    fun addAward(@InputArgument awardName: String, @InputArgument awardType: String, @InputArgument awardValue: Float,
                 @InputArgument categoryId: Long, @InputArgument maxUsages: Int = -1,
                 @InputArgument description: String, @InputArgument fileId: Long?,
                 @InputArgument label: String = ""): Award {
        val arguments = mapOf(
            "awardName" to awardName,
            "awardType" to awardType,
            "awardValue" to awardValue,
            "categoryId" to categoryId,
            "maxUsages" to maxUsages,
            "description" to description,
            "fileId" to fileId,
            "label" to label
        )

        val permissionInput = PermissionInput(
            action = "addAward",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val awardType1 = AwardType.valueOf(awardType.uppercase())

        val category = categoriesRepository.findById(categoryId).orElseThrow { IllegalArgumentException("Invalid category ID") }

        val award = Award(
            awardName = awardName,
            awardType = awardType1,
            awardValue = awardValue.toBigDecimal().setScale(2, RoundingMode.HALF_UP),
            category = category,
            maxUsages = maxUsages,
            description = description,
            label = ""
        )
        val savedAward = awardRepository.save(award)

        fileId?.let {
            photoAssigner.assignPhotoToAssignee(awardRepository, "image/award", savedAward.awardId, fileId)
        }
        return savedAward
    }

    @DgsMutation
    @Transactional
    fun editAward(
        @InputArgument awardId: Long,
        @InputArgument awardName: String?,
        @InputArgument awardType: String?,
        @InputArgument awardValue: Float?,
        @InputArgument categoryId: Long?,
        @InputArgument maxUsages: Int?,
        @InputArgument description: String?,
        @InputArgument fileId: Long?,
        @InputArgument label: String?
    ): Award {
        val arguments = mapOf(
            "awardId" to awardId,
            "awardName" to awardName,
            "awardType" to awardType,
            "awardValue" to awardValue,
            "categoryId" to categoryId,
            "maxUsages" to maxUsages,
            "description" to description,
            "fileId" to fileId,
            "label" to label
        )

        val permissionInput = PermissionInput(
            action = "editAward",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val award = awardRepository.findById(awardId).orElseThrow { IllegalArgumentException("Invalid award ID") }

        awardName?.let {
            award.awardName = it
        }

        awardType?.let {
            val parsedType = AwardType.valueOf(it.uppercase())
            award.awardType = parsedType
        }

        awardValue?.let {
            award.awardValue = it.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        categoryId?.let {
            val category = categoriesRepository.findById(it).orElseThrow { IllegalArgumentException("Invalid category ID") }
            award.category = category
        }

        maxUsages?.let {
            award.maxUsages = it
        }

        description?.let {
            award.description = it
        }

        fileId?.let {
            photoAssigner.assignPhotoToAssignee(awardRepository, "image/award", awardId, fileId)
        }

        label?.let {
            award.label = it
        }

        awardRepository.save(award)
        return award
    }

    @DgsMutation
    @Transactional
    fun removeAward(@InputArgument awardId: Long): Boolean {
        val arguments = mapOf("awardId" to awardId)

        val permissionInput = PermissionInput(
            action = "removeAward",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val award = awardRepository.findById(awardId).orElseThrow { IllegalArgumentException("Invalid award ID") }

        chestAwardRepository.deleteAllByAward(award)
        awardEditionRepository.deleteAllByAward(award)
        awardRepository.delete(award)
        return true
    }

    @DgsMutation
    @Transactional
    fun copyAward(@InputArgument awardId: Long): Award {
        val arguments = mapOf("awardId" to awardId)
        val permissionInput = PermissionInput(
            action = "copyAward",
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val award = awardRepository.findById(awardId).orElseThrow { IllegalArgumentException("Invalid award ID") }

        val awardNameRoot = award.awardName
        var i = 1
        while (awardRepository.findAllByAwardName("$awardNameRoot (Copy $i)").isNotEmpty()) {
            i++
        }
        val awardName = "$awardNameRoot (Copy $i)"

        val awardCopy = Award(
            awardName = awardName,
            awardType = award.awardType,
            awardValue = award.awardValue,
            category = award.category,
            maxUsages = award.maxUsages,
            description = award.description,
            label = award.label
        )
        val savedAward = awardRepository.save(awardCopy)

        assignPhotoToAward(awardCopy.awardId, award.imageFile?.fileId)
        return savedAward
    }
}

data class AwardWithPermissions(
    val award: Award,
    val permissions: ListPermissionsOutput
)
