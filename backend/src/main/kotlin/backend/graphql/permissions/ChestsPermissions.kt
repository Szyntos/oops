package backend.graphql.permissions

import backend.award.AwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.Permission
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getLongList
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class ChestsPermissions {

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

    fun checkListSetupChestsPermission(arguments: JsonNode): Permission{
        val action = "listSetupChests"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą wylistować skrzynki do setupu"
            )
        }

        val editionId = arguments.getLongField("editionId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'editionId'"
        )

        val edition = editionRepository.findById(editionId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono edycji o id $editionId"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAssignPhotoToChestPermission(arguments: JsonNode): Permission {
        val action = "assignPhotoToChest"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą przypisywać zdjęcia do skrzynek"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'chestId'"
        )

        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono skrzynki o id $chestId"
            )

        val chestEditions = chest.chestEdition.map { it.edition }
        if (chestEditions.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }

        val fileId = arguments.getLongField("fileId")

        val photoPermission = photoAssigner.checkAssignPhotoToAssigneePermission(chestsRepository, "image/chest", chest.chestId, fileId)
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

    fun checkAddChestPermission(arguments: JsonNode): Permission {
        val action = "addChest"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą dodawać skrzynki"
            )
        }

        val chestType = arguments.getStringField("chestType") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'chestType'"
        )

        val fileId = arguments.getLongField("fileId")

        val photoPermission = photoAssigner.checkAssignPhotoToAssigneePermission(chestsRepository, "image/chest", null, fileId)
        if (!photoPermission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = photoPermission.reason
            )
        }

        val awardBundleCount = arguments.getLongField("awardBundleCount") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardBundleCount'"
        )

        val awardIds = arguments.getLongList("awardIds") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'awardIds'"
        )

        if (awardBundleCount < 1) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nieprawidłowe 'awardBundleCount'"
            )
        }
        if (awardBundleCount > awardIds.size) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "awardBundleCount nie może być większe niż liczba nagród"
            )
        }

        awardIds.forEach { awardId ->
            val award = awardRepository.findById(awardId).orElse(null)
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nie znaleziono Łupu o id $awardId"
                )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkEditChestPermission(arguments: JsonNode): Permission {
        val action = "editChest"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą edytować skrzynki"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'chestId'"
        )

        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono skrzynki o id $chestId"
            )

        val chestEditions = chest.chestEdition.map { it.edition }

        if (chestEditions.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }

        val fileId = arguments.getLongField("fileId")
        val photoPermission = photoAssigner.checkAssignPhotoToAssigneePermission(chestsRepository, "image/chest", chestId, fileId)
        if (!photoPermission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = photoPermission.reason
            )
        }

        val awardIds = arguments.getLongList("awardIds")
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nieprawidłowe lub brakujące 'awardIds'"
            )

        awardIds.forEach { awardId ->
            val award = awardRepository.findById(awardId).orElse(null)
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nie znaleziono Łupu o id $awardId"
                )
        }

        val awardBundleCount = arguments.getLongField("awardBundleCount")

        if (awardBundleCount != null) {
            if (awardBundleCount < 1) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Nieprawidłowe 'awardBundleCount'"
                )
            }
            if (awardBundleCount > awardIds.size) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "awardBundleCount nie może być większe niż liczba nagród"
                )
            }
        }

        if (chestHistoryRepository.findByChest(chest).any {it.opened}) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Skrzynka już została otwarta przez użytkowników"
            )

        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveChestPermission(arguments: JsonNode): Permission {
        val action = "removeChest"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą usuwać skrzynki"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'chestId'"
        )


        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono skrzynki o id $chestId"
            )

        val chestEditions = chest.chestEdition.map { it.edition }
        if (chestEditions.any { it.endDate.isBefore(LocalDate.now()) }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edycja już się zakończyła"
            )
        }
        if (chestHistoryRepository.existsByChest(chest)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Skrzynka już została przyznana użytkownikom"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkCopyChestPermission(arguments: JsonNode): Permission {
        val action = "copyChest"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą kopiować skrzynki"
            )
        }

        val chestId = arguments.getLongField("chestId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'chestId'"
        )

        val chest = chestsRepository.findById(chestId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono skrzynki o id $chestId"
            )

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}