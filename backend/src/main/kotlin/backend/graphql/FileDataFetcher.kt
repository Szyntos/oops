package backend.graphql

import backend.categories.CategoriesRepository
import backend.chests.Chests
import backend.files.FileEntity
import backend.files.FileEntityRepository
import backend.files.FileRetrievalService
import backend.graphql.utils.*

import backend.points.PointsRepository
import backend.users.UsersRepository
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class FileDataFetcher {
    @Autowired
    private lateinit var fileRetrievalService: FileRetrievalService

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
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }
        val files = fileEntityRepository.findAll()
        return files.groupBy { it.fileType }
            .map { (fileType, files) ->
                FileGroup(fileType = fileType,
                    files = files.sortedByDescending { it.updatedAt }.map { file ->
                        FileWithPermissions(
                            file = file,
                            permissions = ListPermissionsOutput(
                                canAdd = Permission(
                                    "addFile",
                                    objectMapper.createObjectNode(),
                                    false,
                                    "Not applicable"),
                                canEdit =
                                Permission(
                                    "editFile",
                                    objectMapper.createObjectNode(),
                                    false,
                                    "Not applicable"),
                                canCopy =
                                Permission(
                                    "copyFile",
                                    objectMapper.createObjectNode(),
                                    false,
                                    "Not applicable"),
                                canRemove = permissionService.checkPartialPermission(PermissionInput("removeFile", objectMapper.writeValueAsString(mapOf("fileId" to file.fileId)))),
                                canSelect =
                                Permission(
                                    "selectFile",
                                    objectMapper.createObjectNode(),
                                    false,
                                    "Not applicable"),
                                canUnselect =
                                Permission(
                                    "unselectFile",
                                    objectMapper.createObjectNode(),
                                    false,
                                    "Not applicable"),
                                additional = emptyList()
                            )
                        )
                    })
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
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }
        val selectedFiles = fileEntityRepository.findAllByFileTypeIn(fileTypes)
        return selectedFiles.groupBy { it.fileType }
            .map { (fileType, files) ->
                FileGroup(fileType, files.sortedByDescending { it.updatedAt }.map { file ->
                    FileWithPermissions(
                        file = file,
                        permissions = ListPermissionsOutput(
                            canAdd = Permission(
                                "addFile",
                                objectMapper.createObjectNode(),
                                false,
                                "Not applicable"),
                            canEdit =
                            Permission(
                                "editFile",
                                objectMapper.createObjectNode(),
                                false,
                                "Not applicable"),
                            canCopy =
                            Permission(
                                "copyFile",
                                objectMapper.createObjectNode(),
                                false,
                                "Not applicable"),
                            canRemove = permissionService.checkPartialPermission(PermissionInput("removeFile", objectMapper.writeValueAsString(mapOf("fileId" to file.fileId)))),
                            canSelect =
                            Permission(
                                "selectFile",
                                objectMapper.createObjectNode(),
                                false,
                                "Not applicable"),
                            canUnselect =
                            Permission(
                                "unselectFile",
                                objectMapper.createObjectNode(),
                                false,
                                "Not applicable"),
                            additional = emptyList()
                        )
                    )
                })
            }
    }

    @DgsMutation
    @Transactional
    fun removeFile(@InputArgument fileId: Long): Boolean{
        val action = "removeFile"
        val arguments = mapOf(
            "fileId" to fileId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        fileRetrievalService.deleteFile(fileId)
        return true
    }
}

data class FileGroup(
    val fileType: String,
    val files: List<FileWithPermissions>
)

data class FileWithPermissions(
    val file: FileEntity,
    val permissions: ListPermissionsOutput
)
