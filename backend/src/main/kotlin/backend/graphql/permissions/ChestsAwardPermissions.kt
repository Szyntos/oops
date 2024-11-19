package backend.graphql.permissions

import backend.award.AwardRepository
import backend.chestAward.ChestAwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.Permission
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class ChestsAwardPermissions {

    @Autowired
    private lateinit var chestAwardRepository: ChestAwardRepository

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

    fun checkAddAwardToChestPermission(arguments: JsonNode): Permission {
        val action = "addAwardToChest"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add awards to chests"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardId'"
        )

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid award ID"
            )

        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid chest ID"
            )
        val chestEditions = chest.chestEdition.map { it.edition }

        if (chestEditions.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }

        if (!chest.active){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Chest is not active"
            )
        }

        if (award.awardEditions.none { it.edition in chestEditions }){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Award does not exist in this edition"
            )
        }

        if (chestAwardRepository.existsByAwardAndChest(award, chest)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Award already exists in this chest"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveAwardFromChestPermission(arguments: JsonNode): Permission {
        val action = "removeAwardFromChest"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove awards from chests"
            )
        }

        val awardId = arguments.getLongField("awardId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'awardId'"
        )

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'chestId'"
        )

        val award = awardRepository.findById(awardId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid award ID"
            )

        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid chest ID"
            )

        val chestEditions = chest.chestEdition.map { it.edition }

        if (chestEditions.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition with this chest has already ended"
            )
        }

        if (!chest.active){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Chest is not active"
            )
        }

        if (!chestAwardRepository.existsByAwardAndChest(award, chest)){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "This award does not exist in this chest"
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