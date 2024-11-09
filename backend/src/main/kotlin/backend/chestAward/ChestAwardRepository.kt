package backend.chestAward

import backend.award.Award
import backend.chests.Chests
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ChestAwardRepository : JpaRepository<ChestAward, Long> {
    fun existsByAwardAndChest(award: Award, chest: Chests): Boolean
    fun deleteAllByAward(award: Award)
    fun deleteByAwardAndChest(award: Award, chest: Chests)
    fun findByChest(chest: Chests): List<ChestAward>
    fun findByChestAndAward(chest: Chests, award: Award): ChestAward?
    fun findAllByAward(award: Award): List<ChestAward>
}
