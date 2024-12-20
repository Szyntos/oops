package backend.graphql.partialPermissions

import backend.award.AwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.utils.Permission
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class FilePartialPermissions {

    @Autowired
    private lateinit var fileEntityRepository: FileEntityRepository

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

    fun checkRemoveFilePermission(arguments: JsonNode): Permission {
        val action = "removeFile"
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Tylko koordynatorzy mogą usuwać pliki"
            )
        }

        val fileId = arguments.getLongField("fileId") ?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Nieprawidłowe lub brakujące 'fileId'"
        )

        val file = fileEntityRepository.findById(fileId).orElse(null)
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Nie znaleziono pliku o id $fileId"
            )

        if (file.chests.isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Plik jest już wykorzystywany w skrzynkach"
            )
        }

        if (file.awards.isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Plik jest już wykorzystywany w łupach"
            )
        }

        if (file.levels.isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Plik jest już wykorzystywany w poziomach"
            )
        }

        if (file.users.isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Plik jest już wykorzystywany w użytkownikach"
            )
        }

        if (file.groups.isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Plik jest już wykorzystywany w grupach"
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