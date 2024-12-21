package backend.files

import org.springframework.stereotype.Service
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import org.springframework.web.multipart.MultipartFile


@Service
class FileRetrievalService(private val fileEntityRepository: FileEntityRepository) {

    fun getFileContent(fileId: Long): Pair<Path, ByteArray> {
        val fileEntity = fileEntityRepository.findById(fileId).orElseThrow { IllegalArgumentException("Nie znaleziono pliku o id $fileId") }
        val filePath = Paths.get(fileEntity.pathToFile)
        val fileContent = Files.readAllBytes(filePath)
        return Pair(filePath, fileContent)
    }
    fun deleteFile(fileId: Long) {
        val fileEntity = fileEntityRepository.findById(fileId).orElseThrow { IllegalArgumentException("Nie znaleziono pliku o id $fileId") }
        val filePath = Paths.get(fileEntity.pathToFile)
        Files.deleteIfExists(filePath)
        fileEntityRepository.delete(fileEntity)
    }

    fun updateFile(fileId: Long, newFile: MultipartFile): FileEntity {
        val fileEntity = fileEntityRepository.findById(fileId).orElseThrow { IllegalArgumentException("Nie znaleziono pliku o id $fileId") }
        val filePath = Paths.get(fileEntity.pathToFile)

        // Delete the old file
        Files.deleteIfExists(filePath)

        // Save the new file
        val newFilePath = Paths.get(fileEntity.pathToFile).toAbsolutePath().parent.resolve(newFile.originalFilename!!)
        Files.copy(newFile.inputStream, newFilePath)

        // Update file entity
        fileEntity.pathToFile = newFilePath.toString()
        fileEntity.fileName = newFile.originalFilename!!
        fileEntity.fileType = newFile.contentType ?: "unknown"
        return fileEntityRepository.save(fileEntity)
    }
}
