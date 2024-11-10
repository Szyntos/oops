package backend.award

import backend.categories.Categories
import backend.edition.Edition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AwardRepository : JpaRepository<Award, Long> {
    fun findAllByAwardName(awardName: String): List<Award>
    fun existsByCategory(category: Categories): Boolean
    fun findByAwardEditions_Edition(edition: Edition): List<Award>
}
