package backend.graphql

import backend.award.Award
import backend.points.Points
import backend.points.PointsRepository
import backend.chestHistory.ChestHistoryRepository
import backend.award.AwardRepository
import backend.award.AwardType
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.Bonuses
import backend.bonuses.BonusesRepository
import backend.chestHistory.ChestHistory
import backend.edition.Edition
import backend.files.FileEntityRepository
import backend.groups.GroupsRepository
import backend.subcategories.SubcategoriesRepository
import backend.utils.HasImageFile
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import kotlin.math.min

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
}


