package backend.gradingChecks

import backend.categories.Categories
import backend.edition.Edition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface GradingChecksRepository : JpaRepository<GradingChecks, Long> {
    fun existsByEdition(edition: Edition): Boolean
    fun findByEdition(edition: Edition): Optional<GradingChecks>
    fun existsByProject(category: Categories): Boolean
    fun existsByProjectAndEdition(category: Categories, edition: Edition): Boolean
}
