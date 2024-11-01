package backend.awardEdition

import backend.award.Award
import backend.edition.Edition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface AwardEditionRepository : JpaRepository<AwardEdition, Long> {
    fun findByAward(award: Award): List<AwardEdition>
    fun existsByAward_AwardNameAndEdition(awardName: String, edition: Edition): Boolean
    fun existsByAwardAndEdition(award: Award, edition: Edition): Boolean
    fun deleteAllByAward(award: Award)
    fun deleteByAwardAndEdition(award: Award, edition: Edition)
}
