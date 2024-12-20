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

    fun checkListSetupEditionsPermission(arguments: JsonNode): Permission {
        val action = "setupEditions"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą ustawiać edycje"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddEditionPermission(arguments: JsonNode): Permission {
        val action = "addEdition"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą dodawać edycje"
            )
        }

//        @InputArgument editionName: String, @InputArgument editionYear: Int, @InputArgument label: String = ""

        val editionName = arguments.getStringField("editionName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionName'"
        )

        val editionYear = arguments.getIntField("editionYear") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionYear'"
        )


        if (editionRepository.existsByEditionName(editionName)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja o nazwie $editionName już istnieje"
            )
        }
        if (editionRepository.existsByEditionYear(editionYear)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja z rokiem $editionYear już istnieje"
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
                reason = "Tylko koordynatorzy mogą edytować edycje"
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
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val editionName = arguments.getStringField("editionName")

        val editionYear = arguments.getIntField("editionYear")


        val edition = editionRepository.findById(editionId)
            .orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )


        if (edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }
        if (edition.startDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już wystartowała"
            )
        }

        editionName?.let {
            if (editionRepository.existsByEditionName(it) && it != edition.editionName) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja o nazwie $it już istnieje"
                )
            }
        }

        editionYear?.let {
            if (editionRepository.existsByEditionYear(it) && it != edition.editionYear) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edycja z rokiem $it już istnieje"
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
                reason = "Tylko koordynatorzy mogą usuwać edycje"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val edition = editionRepository.findById(editionId)
            .orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )


        if (edition.endDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }
        if (edition.startDate.isBefore(LocalDate.now())) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już wystartowała"
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
                reason = "Tylko koordynatorzy mogą kopiować edycje"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val editionYear = arguments.getIntField("editionYear") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionYear'"
        )

        val editionName = arguments.getStringField("editionName") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionName'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )

        if (editionRepository.existsByEditionYear(editionYear)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja z rokiem $editionYear już istnieje"
            )
        }

        if (editionRepository.existsByEditionName(editionName)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja o nazwie $editionName już istnieje"
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