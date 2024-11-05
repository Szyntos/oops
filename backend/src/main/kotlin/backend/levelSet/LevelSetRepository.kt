package backend.levelSet

import backend.files.FileEntity
import backend.levels.Levels
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface LevelSetRepository : JpaRepository<LevelSet, Long> {
//    fun findByEdition(edition: Edition): List<Levels>

}
