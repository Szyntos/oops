package backend.graphql.partialPermissions

import backend.award.AwardRepository
import backend.categories.CategoriesRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.graphql.AwardEditionDataFetcher
import backend.graphql.CategoryEditionDataFetcher
import backend.graphql.ChestEditionDataFetcher
import backend.graphql.GroupsDataFetcher
import backend.graphql.permissions.*
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.Permission
import backend.groups.GroupsRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getIntField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class EditionPartialPermissions {

    @Autowired
    private lateinit var gradingChecksPermissions: GradingChecksPermissions

    @Autowired
    private lateinit var groupsPermissions: GroupsPermissions

    @Autowired
    private lateinit var chestEditionPermissions: ChestEditionPermissions

    @Autowired
    private lateinit var awardEditionPermissions: AwardEditionPermissions

    @Autowired
    private lateinit var categoryEditionPermissions: CategoryEditionPermissions

    @Autowired
    private lateinit var groupsRepository: GroupsRepository

    @Autowired
    private lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    private lateinit var editionRepository: EditionRepository

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

    fun checkEditEditionPermission(arguments: JsonNode): Permission {
        val action = "editEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can edit editions"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val edition = editionRepository.findById(editionId)
            .orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )


        if (edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }
        if (edition.startDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already started"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveEditionPermission(arguments: JsonNode): Permission {
        val action = "removeEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove editions"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val edition = editionRepository.findById(editionId)
            .orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )


        if (edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }
        if (edition.startDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already started"
            )
        }

        val categories = categoriesRepository.findByCategoryEdition_Edition(edition)
        categories.forEach {
            val permission = categoryEditionPermissions.checkRemoveCategoryFromEditionHelperPermission(it.categoryId, edition.editionId)
            if (!permission.allow) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = permission.reason
                )
            }
        }

        val awards = awardRepository.findByAwardEditions_Edition(edition)

        awards.forEach {
            val permission = awardEditionPermissions.checkRemoveAwardFromEditionHelperPermission(it.awardId, edition.editionId)
            if (!permission.allow) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = permission.reason
                )
            }
        }

        val chests = chestsRepository.findByChestEdition_Edition(edition)

        chests.forEach {
            val permission = chestEditionPermissions.checkRemoveChestFromEditionHelperPermission(it.chestId, edition.editionId)
            if (!permission.allow) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = permission.reason
                )
            }
        }

        val groups = groupsRepository.findByEdition(edition)

        groups.forEach {
            val permission = groupsPermissions.checkRemoveGroupHelperPermission(it.groupsId)
            if (!permission.allow) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = permission.reason
                )
            }
        }

        val gradingChecks = edition.gradingChecks
        gradingChecks.forEach {
            val permission = gradingChecksPermissions.checkRemoveGradingCheckHelperPermission(it.gradingCheckId)
            if (!permission.allow) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = permission.reason
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

    fun checkCopyEditionPermission(arguments: JsonNode): Permission {
        val action = "copyEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can copy editions"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}