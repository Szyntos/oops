package backend.graphql.permissions

import backend.award.AwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.graphql.PhotoAssigner
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getIntField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getLongList
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class FilePermissions {

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

    fun checkGetFilesGroupedByTypePermission(arguments: JsonNode): Permission {
        val action = "getFilesGroupedByType"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.COORDINATOR || currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.STUDENT || currentUser.role == UsersRoles.UNAUTHENTICATED_USER)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators, teachers, students and unauthenticated users can get files grouped by type"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkGetFilesGroupedByTypeBySelectedTypesPermission(arguments: JsonNode): Permission {
        val action = "getFilesGroupedByTypeBySelectedTypes"
        val currentUser = userMapper.getCurrentUser()
        if (!(currentUser.role == UsersRoles.COORDINATOR || currentUser.role == UsersRoles.TEACHER || currentUser.role == UsersRoles.STUDENT || currentUser.role == UsersRoles.UNAUTHENTICATED_USER)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators, teachers, students and unauthenticated users can get files grouped by type by selected types"
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