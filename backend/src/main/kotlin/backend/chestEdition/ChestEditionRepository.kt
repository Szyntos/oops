package backend.chestEdition

import backend.categories.Categories
import backend.chests.Chests
import backend.edition.Edition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ChestEditionRepository: JpaRepository<ChestEdition, Long> {
    fun existsByChest_ChestTypeAndEdition(chestType: String, edition: Edition): Boolean
    fun existsByChestAndEdition(chest: Chests, edition: Edition): Boolean
    fun findByChest_ChestIdAndEdition_EditionId(chestId: Long, editionId: Long): ChestEdition?
    fun deleteByChestAndEdition(chest: Chests, edition: Edition)
    fun deleteByChest(chest: Chests)

}
