package backend.chestHistory

import backend.chests.Chests
import backend.edition.Edition
import backend.users.Users
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ChestHistoryRepository : JpaRepository<ChestHistory, Long> {
    fun findByUserAndChest(userId: Users, chestId: Chests) : List<ChestHistory>
    fun findByChest(chest: Chests) : List<ChestHistory>
    fun existsByChest(chest: Chests) : Boolean
    fun existsByChestAndSubcategory_Edition(chest: Chests, edition: Edition) : Boolean
}
