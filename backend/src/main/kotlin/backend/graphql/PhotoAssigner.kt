package backend.graphql

import backend.files.FileEntityRepository
import backend.graphql.permissions.Permission
import backend.utils.HasImageFile
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class PhotoAssigner {

    @Autowired
    lateinit var fileRepository: FileEntityRepository

    @Transactional
    fun <T> assignPhotoToAssignee(
        assigneeRepository: JpaRepository<T, Long>,
        fileType: String,
        assigneeId: Long,
        fileId: Long?
    ): Boolean where T : HasImageFile {
        val assignee = assigneeRepository.findById(assigneeId).orElseThrow {
            IllegalArgumentException("Invalid assignee ID")
        }

        val photo = fileId?.let {
            fileRepository.findById(it)
                .orElseThrow { IllegalArgumentException("Invalid file ID") }
        } ?: fileRepository.findAllByFileType("$fileType/sample").firstOrNull()

        photo?.let {
            require(it.fileType == fileType || it.fileType == "$fileType/sample") {
                "Wrong fileType of file $fileId. Please upload a file with fileType = $fileType and try again."
            }
        }

        assignee.imageFile = photo
        assigneeRepository.save(assignee)

        return true
    }

    @Transactional
    fun <T> checkAssignPhotoToAssigneePermission(assigneeRepository: JpaRepository<T, Long>,
                                                 fileType: String,
                                                 assigneeId: Long?,
                                                 fileId: Long?): Permission where T : HasImageFile {
        val action = "assignPhotoToAward"
        val arguments = objectMapper.readTree("""{"fileType": "$fileType", "assigneeId": "$assigneeId", "fileId": "$fileId"}""")
        if (assigneeId != null) {
            val assignee = assigneeRepository.findById(assigneeId).orElse(null)
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Invalid assignee ID"
                )
        }

        val photo = fileId?.let {
            fileRepository.findById(it)
                .orElse(null)
        } ?: fileRepository.findAllByFileType("$fileType/sample").firstOrNull()

        if (photo != null) {
            if (photo.fileType != fileType && photo.fileType != "$fileType/sample") {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Wrong fileType of file $fileId. Please upload a file with fileType = $fileType and try again."
                )
            }
        }

        if (photo == null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Invalid file ID"
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


