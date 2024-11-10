package backend.edition

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface EditionRepository : JpaRepository<Edition, Long> {
    fun findByEditionYear(year: Int): Edition
    fun existsByEditionYear(year: Int): Boolean
    fun existsByEditionName(name: String): Boolean
    fun findAllByEditionName(name: String): List<Edition>
}
