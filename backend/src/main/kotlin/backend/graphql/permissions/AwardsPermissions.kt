package backend.graphql.permissions

import backend.award.AwardRepository
import backend.award.AwardType
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.categories.CategoriesRepository
import backend.chestAward.ChestAwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.graphql.PhotoAssigner
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getFloatField
import backend.utils.JsonNodeExtensions.getIntField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.RoundingMode
import java.time.LocalDate

@Service
class AwardsPermissions {

    @Autowired
    private lateinit var chestAwardRepository: ChestAwardRepository

    @Autowired
    private lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    private lateinit var editionRepository: EditionRepository

    @Autowired
    private lateinit var bonusesRepository: BonusesRepository

    @Autowired
    private lateinit var awardEditionRepository: AwardEditionRepository

    @Autowired
    private lateinit var awardRepository: AwardRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var chestsRepository: ChestsRepository

    @Autowired
    private lateinit var chestEditionRepository: ChestEditionRepository

    @Autowired
    private lateinit var chestHistoryRepository: ChestHistoryRepository

    @Autowired
    private lateinit var photoAssigner: PhotoAssigner

    fun checkAssignPhotoToAwardPermission(arguments: JsonNode): Permission {
        val action = "assignPhotoToAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can assign photos to awards"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardId'"
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid award ID"
            )

        val fileId = arguments.getLongField("fileId")

        val photoPermission = photoAssigner.checkAssignPhotoToAssigneePermission(awardRepository, "image/award", award.awardId, fileId)
        if (!photoPermission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = photoPermission.reason
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddAwardPermission(arguments: JsonNode): Permission {
        val action = "addAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add awards"
            )
        }

        val awardName = arguments.getStringField("awardName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardName'"
        )

        val awardType = arguments.getStringField("awardType") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardType'"
        )

        val awardValue = arguments.getFloatField("awardValue") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardValue'"
        )

        val categoryId = arguments.getLongField("categoryId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'categoryId'"
        )

        val maxUsages = arguments.getIntField("maxUsages")

        val description = arguments.getStringField("description") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'description'"
        )

        val fileId = arguments.getLongField("fileId")

        val awardType1 = try {
            AwardType.valueOf(awardType.uppercase())
        } catch (e: IllegalArgumentException) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid award type"
            )
        }

        if ((awardType1 == AwardType.ADDITIVE ||
                    awardType1 == AwardType.ADDITIVE_NEXT ||
                    awardType1 == AwardType.ADDITIVE_PREV) && awardValue < 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Additive award value must be greater than or equal to 0"
            )
        }

        if (awardType1 == AwardType.MULTIPLICATIVE && (awardValue <= 0 || awardValue > 1)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Multiplicative award value must be greater than 0 and less than or equal to 1"
            )
        }

        val category = categoriesRepository.findById(categoryId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid category ID"
            )

        val awardsWithSameName = awardRepository.findAllByAwardName(awardName)
        if (awardsWithSameName.any { it.awardType != awardType1 }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Award with this name cannot be added with this type (already exists with different type)"
            )
        }
        if (awardsWithSameName.any { it.awardValue == awardValue.toBigDecimal().setScale(2, RoundingMode.HALF_UP)  }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Award with this name and value already exists"
            )
        }
        if (!category.canAddPoints) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "This category does not allow adding points from awards"
            )
        }

        val photoPermission = photoAssigner.checkAssignPhotoToAssigneePermission(awardRepository, "image/award", null, fileId)
        if (!photoPermission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = photoPermission.reason
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkEditAwardPermission(arguments: JsonNode): Permission {
        val action = "editAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can edit awards"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardId'"
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid award ID"
            )

        val awardName = arguments.getStringField("awardName")

        val awardType = arguments.getStringField("awardType")

        val awardValue = arguments.getFloatField("awardValue")

        val categoryId = arguments.getLongField("categoryId")

        val maxUsages = arguments.getIntField("maxUsages")

        val description = arguments.getStringField("description")

        val fileId = arguments.getLongField("fileId")

        if (award.awardEditions.map { it.edition }.any { it.endDate.isBefore(java.time.LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition with this award has already ended"
            )
        }

        if (award.awardEditions.map { it.edition }.any { it.startDate.isBefore(java.time.LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition with this award has already started"
            )
        }

        if (awardName != null) {
            val awardsWithSameName = awardRepository.findAllByAwardName(awardName)
            if (awardsWithSameName.any { it.awardType != award.awardType }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Award with this name cannot be added with this type (already exists with different type)"
                )
            }
            if (awardsWithSameName.any { it.awardValue == award.awardValue }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Award with this name and value already exists"
                )
            }
        }

        if (awardType != null && awardValue != null) {
            val awardType1 = try {
                AwardType.valueOf(awardType.uppercase())
            } catch (e: IllegalArgumentException) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid award type"
                )
            }

            if ((awardType1 == AwardType.ADDITIVE ||
                        awardType1 == AwardType.ADDITIVE_NEXT ||
                        awardType1 == AwardType.ADDITIVE_PREV) && awardValue < 0
            ) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Additive award value must be greater than or equal to 0"
                )
            }

            if (awardType1 == AwardType.MULTIPLICATIVE && (awardValue <= 0 || awardValue > 1)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Multiplicative award value must be greater than 0 and less than or equal to 1"
                )
            }
        }

        if (awardType != null && awardValue == null) {
            val awardType1 = try {
                AwardType.valueOf(awardType.uppercase())
            } catch (e: IllegalArgumentException) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid award type"
                )
            }
            val oldAwardValue = award.awardValue

            if ((awardType1 == AwardType.ADDITIVE ||
                        awardType1 == AwardType.ADDITIVE_NEXT ||
                        awardType1 == AwardType.ADDITIVE_PREV) && oldAwardValue.toFloat() < 0
            ) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Additive award value must be greater than or equal to 0"
                )
            }

            if (awardType1 == AwardType.MULTIPLICATIVE && (oldAwardValue.toFloat() <= 0 || oldAwardValue.toFloat() > 1)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Multiplicative award value must be greater than 0 and less than or equal to 1"
                )
            }
        }

        if (awardType == null && awardValue != null) {
            val oldAwardType = award.awardType
            if ((oldAwardType == AwardType.ADDITIVE ||
                        oldAwardType == AwardType.ADDITIVE_NEXT ||
                        oldAwardType == AwardType.ADDITIVE_PREV) && awardValue < 0
            ) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Additive award value must be greater than or equal to 0"
                )
            }

            if (oldAwardType == AwardType.MULTIPLICATIVE && (awardValue <= 0 || awardValue > 1)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Multiplicative award value must be greater than 0 and less than or equal to 1"
                )
            }
        }

        if (categoryId != null) {
            val category = categoriesRepository.findById(categoryId).orElse(null)
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid category ID"
                )
            if (!category.canAddPoints) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "This category does not allow adding points from awards"
                )
            }
        }

        if (fileId != null) {
            val photoPermission =
                photoAssigner.checkAssignPhotoToAssigneePermission(awardRepository, "image/award", null, fileId)
            if (!photoPermission.allow) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = photoPermission.reason
                )
            }
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveAwardPermission(arguments: JsonNode): Permission {
        val action = "removeAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove awards"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardId'"
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid award ID"
            )

        if (award.awardEditions.map { it.edition }.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition with this award has already ended"
            )
        }

        if (bonusesRepository.existsByAward(award)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Award is already in use"
            )
        }

        val awardBundleCounts = chestAwardRepository.findAllByAward(award).map { Pair(it.chest.awardBundleCount, chestAwardRepository.findByChest(it.chest).size) }

        if (awardBundleCounts.any {it.first >= it.second}){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Removing this award would cause some chests to have their award bundle count bigger than the number of awards in them"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkCopyAwardPermission(arguments: JsonNode): Permission {
        val action = "copyAward"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can copy awards"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardId'"
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid award ID"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}