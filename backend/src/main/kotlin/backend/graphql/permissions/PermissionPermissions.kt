package backend.graphql.permissions

import backend.award.AwardRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.graphql.utils.PhotoAssigner
import backend.levels.LevelsRepository
import backend.graphql.utils.Permission
import backend.users.UsersRepository
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class PermissionPermissions {

    @Autowired
    private lateinit var usersRepository: UsersRepository

    @Autowired
    private lateinit var levelsRepository: LevelsRepository

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

    fun checkCheckFullPermissionPermission(arguments: JsonNode): Permission {
        val action = "checkFullPermission"
        val currentUser = userMapper.getCurrentUser()

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkCheckPartialPermissionPermission(arguments: JsonNode): Permission {
        val action = "checkPartialPermission"
        val currentUser = userMapper.getCurrentUser()

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}