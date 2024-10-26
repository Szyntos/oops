package backend.graphql

import backend.categories.CategoriesRepository
import backend.files.FileEntity
import backend.files.FileEntityRepository

import backend.points.PointsRepository
import backend.users.UsersRepository
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class FileDataFetcher {
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
        val files = fileEntityRepository.findAll()
        return files.groupBy { it.fileType }
            .map { (fileType, files) ->
                FileGroup(fileType, files.sortedByDescending { it.updatedAt })
            }
    }

    @DgsQuery
    @Transactional
    fun getFilesGroupedByTypeBySelectedTypes(@InputArgument fileTypes: List<String>): List<FileGroup> {
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
