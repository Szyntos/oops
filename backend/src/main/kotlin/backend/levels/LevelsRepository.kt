package backend.levels

import backend.edition.Edition
import backend.files.FileEntity
import backend.levelSet.LevelSet
import backend.levels.Levels
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.math.BigDecimal

@Repository
interface LevelsRepository : JpaRepository<Levels, Long> {
//    fun findByEdition(edition: Edition): List<Levels>
    fun findByImageFile_FileId(fileId: Long): List<Levels>
    fun findByLevelSet(levelSet: LevelSet): List<Levels>
    fun findByImageFile(file: FileEntity): List<Levels>
    fun findFirstByGradeAndLevelSetOrderByOrdinalNumber(grade: BigDecimal, levelSet: LevelSet): Levels?
}
