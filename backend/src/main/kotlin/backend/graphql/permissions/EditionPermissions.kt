package backend.graphql.permissions

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
class EditionPermissions {

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

    fun checkAddEditionPermission(arguments: JsonNode): Permission {
        val action = "addEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add editions"
            )
        }

//        @InputArgument editionName: String, @InputArgument editionYear: Int, @InputArgument label: String = ""

        val editionName = arguments.getStringField("editionName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionName'"
        )

        val editionYear = arguments.getIntField("editionYear") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionYear'"
        )


        if (editionRepository.existsByEditionName(editionName)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition with name $editionName already exists"
            )
        }
        if (editionRepository.existsByEditionYear(editionYear)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition with year $editionYear already exists"
            )
        }

        val currentYear = LocalDate.now().year

        if (editionYear < currentYear-1 || editionYear > currentYear + 10) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition year must be between ${currentYear-1} and ${currentYear + 10}"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

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

//        @InputArgument editionId: Long,
//        @InputArgument editionName: String?,
//        @InputArgument editionYear: Int?,
//        @InputArgument label: String?

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )

        val editionName = arguments.getStringField("editionName")

        val editionYear = arguments.getIntField("editionYear")


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

        editionName?.let {
            if (editionRepository.existsByEditionName(it) && it != edition.editionName) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition with name $it already exists"
                )
            }
        }

        editionYear?.let {
            val currentYear = LocalDate.now().year
            if (it < currentYear || it > currentYear + 10) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition year must be between $currentYear and ${currentYear + 10}"
                )
            }
            if (editionRepository.existsByEditionYear(it) && it != edition.editionYear) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition with year $it already exists"
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
            categoryEditionPermissions.checkRemoveCategoryFromEditionHelperPermission(it.categoryId, edition.editionId)
        }

        val awards = awardRepository.findByAwardEditions_Edition(edition)

        awards.forEach {
            awardEditionPermissions.checkRemoveAwardFromEditionHelperPermission(it.awardId, edition.editionId)
        }

        val chests = chestsRepository.findByChestEdition_Edition(edition)

        chests.forEach {
            chestEditionPermissions.checkRemoveChestFromEditionHelperPermission(it.chestId, edition.editionId)
        }

        val groups = groupsRepository.findByEdition(edition)

        groups.forEach {
            groupsPermissions.checkRemoveGroupHelperPermission(it.groupsId)
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

        val editionYear = arguments.getIntField("editionYear") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionYear'"
        )

        val editionName = arguments.getStringField("editionName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionName'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid edition ID"
            )

        val currentYear = LocalDate.now().year

        if (editionYear < currentYear-1 || editionYear > currentYear + 10) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition year must be between ${currentYear-1} and ${currentYear + 10}"
            )
        }

        if (editionRepository.existsByEditionYear(editionYear)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition with year $editionYear already exists"
            )
        }

        if (editionRepository.existsByEditionName(editionName)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition with name $editionName already exists"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}