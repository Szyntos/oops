package backend.graphql

import backend.categories.CategoriesRepository
import backend.files.FileEntity
import backend.files.FileEntityRepository
import backend.graphql.permissions.PermissionInput
import backend.graphql.permissions.PermissionService

import backend.points.PointsRepository
import backend.users.UsersRepository
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class FileDataFetcher {
    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    lateinit var usersRepository: UsersRepository

    @Autowired
    lateinit var pointsRepository: PointsRepository

    @Autowired
    lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    lateinit var photoAssigner: PhotoAssigner

    @Autowired
    lateinit var fileEntityRepository: FileEntityRepository

    @Autowired
    lateinit var userMapper: UserMapper

    @DgsQuery
    @Transactional
    fun getFilesGroupedByType(): List<FileGroup> {
        val action = "getFilesGroupedByType"
        val arguments = mapOf<String, Any>()
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }
        val files = fileEntityRepository.findAll()
        return files.groupBy { it.fileType }
            .map { (fileType, files) ->
                FileGroup(fileType, files.sortedByDescending { it.updatedAt })
            }
    }

    @DgsQuery
    @Transactional
    fun getFilesGroupedByTypeBySelectedTypes(@InputArgument fileTypes: List<String>): List<FileGroup> {
        val action = "getFilesGroupedByTypeBySelectedTypes"
        val arguments = mapOf(
            "fileTypes" to fileTypes
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }
        val selectedFiles = fileEntityRepository.findAllByFileTypeIn(fileTypes)
        return selectedFiles.groupBy { it.fileType }
            .map { (fileType, files) ->
                FileGroup(fileType, files.sortedByDescending { it.updatedAt })
            }
    }
}

data class FileGroup(
    val fileType: String,
    val files: List<FileEntity>
)
