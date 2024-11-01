package backend.award

import backend.categories.Categories
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AwardRepository : JpaRepository<Award, Long> {
    fun findAllByAwardName(awardName: String): List<Award>
    fun existsByCategory(category: Categories): Boolean
}
