package backend.files

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.io.IOException

@Service
class FileUploadService(private val fileEntityRepository: FileEntityRepository) {

    @Value("\${file.upload-dir}")
    private lateinit var uploadDir: String

    fun saveFile(file: MultipartFile, fileType: String): FileEntity {
        val originalFilename = Paths.get(file.originalFilename ?: "").fileName.toString()
        val fileExtension = getFileExtension(originalFilename)
        val filenameWithoutExtension = getFilenameWithoutExtension(originalFilename)
        validateFileType(fileType)

        // Resolve the relative path to an absolute path
        val directoryPath = Paths.get(uploadDir).toAbsolutePath().resolve(fileType)
        if (Files.notExists(directoryPath)) {
            Files.createDirectories(directoryPath)
        }

        var targetPath = directoryPath.resolve(originalFilename)
        var counter = 1

        // Check if the file exists and generate a new filename with a suffix
        while (Files.exists(targetPath)) {
            val newFilename = "${filenameWithoutExtension}_$counter.$fileExtension"
            targetPath = directoryPath.resolve(newFilename)
            counter++
        }

        // Save the file with the unique name
        try {
            Files.copy(file.inputStream, targetPath)
        } catch (e: IOException) {
            throw RuntimeException("Failed to store file $originalFilename due to IO error: ${e.message}", e)
        }

        // Create a new FileEntity and save it to the database
        val fileEntity = FileEntity(
            pathToFile = targetPath.toString(),
            fileName = targetPath.fileName.toString(),
            fileType = fileType
        )
        return fileEntityRepository.save(fileEntity)
    }

    private fun validateFileType(fileType: String) {
        val allowedPattern = Regex("^[a-zA-Z0-9/_-]+$")
        if (!allowedPattern.matches(fileType)) {
            throw IllegalArgumentException("Invalid fileType: '$fileType'. It should only contain alphanumeric characters, underscores, hyphens, and slashes.")
        }
    }

    private fun getFileExtension(filename: String): String {
        return filename.substringAfterLast('.', "")
    }

    private fun getFilenameWithoutExtension(filename: String): String {
        return filename.substringBeforeLast('.', "")
    }
}
