package backend.graphql

import backend.award.Award
import backend.award.AwardRepository
import backend.award.AwardType
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.categories.CategoriesRepository
import backend.chestAward.ChestAwardRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.RoundingMode

@DgsComponent
class AwardsDataFetcher {

    @Autowired
    private lateinit var awardEditionRepository: AwardEditionRepository

    @Autowired
    private lateinit var chestAwardRepository: ChestAwardRepository

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

    @DgsMutation
    @Transactional
    fun assignPhotoToAward(@InputArgument awardId: Long, @InputArgument fileId: Long?): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can assign photos to awards")
        }

        return photoAssigner.assignPhotoToAssignee(awardRepository, "image/award", awardId, fileId)
    }

    @DgsMutation
    @Transactional
    fun addAward(@InputArgument awardName: String, @InputArgument awardType: String, @InputArgument awardValue: Float,
                 @InputArgument categoryId: Long, @InputArgument maxUsages: Int = -1,
                 @InputArgument description: String, @InputArgument fileId: Long?,
                 @InputArgument label: String = ""): Award {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can add awards")
        }

        val awardType1 = try {
             AwardType.valueOf(awardType.uppercase())
        } catch (e: IllegalArgumentException) {
            throw IllegalArgumentException("Invalid award type")
        }
        if ((awardType1 == AwardType.ADDITIVE ||
                    awardType1 == AwardType.ADDITIVE_NEXT ||
                    awardType1 == AwardType.ADDITIVE_PREV) && awardValue < 0) {
            throw IllegalArgumentException("Additive award value must be greater than or equal to 0")
        }
        if (awardType1 == AwardType.MULTIPLICATIVE && (awardValue <= 0 || awardValue > 1)) {
            throw IllegalArgumentException("Multiplicative award value must be greater than 0 and less than or equal to 1")
        }
        val category = categoriesRepository.findById(categoryId).orElseThrow { IllegalArgumentException("Invalid category ID") }
        val awardsWithSameName = awardRepository.findAllByAwardName(awardName)
        if (awardsWithSameName.any { it.awardType != awardType1 }) {
            throw IllegalArgumentException("Award with this name cannot be added with this type (already exists with different type)")
        }
        if (awardsWithSameName.any { it.awardValue == awardValue.toBigDecimal().setScale(2, RoundingMode.HALF_UP)  }) {
            throw IllegalArgumentException("Award with this name and value already exists")
        }
        if (!category.canAddPoints) {
            throw IllegalArgumentException("This category does not allow adding points from awards")
        }

        val award = Award(
            awardName = awardName,
            awardType = awardType1,
            awardValue = awardValue.toBigDecimal().setScale(2, java.math.RoundingMode.HALF_UP),
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can edit awards")
        }

        val award = awardRepository.findById(awardId).orElseThrow { IllegalArgumentException("Invalid award ID") }

        if (award.awardEditions.map { it.edition }.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
            throw IllegalArgumentException("Edition with this award has already ended")
        }

        if (award.awardEditions.map { it.edition }.any { it.startDate.isBefore(java.time.LocalDate.now()) }) {
            throw IllegalArgumentException("Edition with this award has already started")
        }

        awardName?.let {
            val awardsWithSameName = awardRepository.findAllByAwardName(it)
            if (awardsWithSameName.any { existing -> existing.awardType != award.awardType }) {
                throw IllegalArgumentException("Award with this name cannot be updated with this type (already exists with different type)")
            }
            award.awardName = it
        }

        awardType?.let {
            val parsedType = try {
                AwardType.valueOf(it.uppercase())
            } catch (e: IllegalArgumentException) {
                throw IllegalArgumentException("Invalid award type")
            }
            award.awardType = parsedType
        }

        awardValue?.let {
            if ((award.awardType == AwardType.ADDITIVE || award.awardType == AwardType.ADDITIVE_NEXT || award.awardType == AwardType.ADDITIVE_PREV) && it < 0) {
                throw IllegalArgumentException("Additive award value must be greater than or equal to 0")
            }
            if (award.awardType == AwardType.MULTIPLICATIVE && (it <= 0 || it > 1)) {
                throw IllegalArgumentException("Multiplicative award value must be greater than 0 and less than or equal to 1")
            }
            award.awardValue = it.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        categoryId?.let {
            val category = categoriesRepository.findById(it).orElseThrow { IllegalArgumentException("Invalid category ID") }
            if (!category.canAddPoints) {
                throw IllegalArgumentException("This category does not allow adding points from awards")
            }
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can remove awards")
        }

        val award = awardRepository.findById(awardId).orElseThrow { IllegalArgumentException("Invalid award ID") }
        if (award.awardEditions.map { it.edition }.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
            throw IllegalArgumentException("Edition with this award has already ended")
        }

        if (bonusesRepository.existsByAward(award)) {
            throw IllegalArgumentException("Award is already in use")
        }

        chestAwardRepository.deleteAllByAward(award)
        awardEditionRepository.deleteAllByAward(award)
        awardRepository.delete(award)
        return true
    }

    @DgsMutation
    @Transactional
    fun copyAward(@InputArgument awardId: Long): Award {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can copy awards")
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
