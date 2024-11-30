package backend.subcategories

import backend.categories.Categories
import backend.edition.Edition
import jakarta.persistence.TypedQuery
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface SubcategoriesRepository : JpaRepository<Subcategories, Long> {
    fun findBySubcategoryNameAndCategory(subcategoryName:String, category: Categories) : List<Subcategories>
    fun findFirstByCategoryAndEditionAndOrdinalNumberGreaterThanOrderByOrdinalNumberAsc(
        category: Categories,
        edition: Edition,
        ordinalNumber: Int
    ): Optional<Subcategories>
    fun findFirstByCategoryOrderByOrdinalNumberAsc(category: Categories): Optional<Subcategories>
    fun findFirstByCategoryAndEditionOrderByOrdinalNumberAsc(category: Categories, edition: Edition): Optional<Subcategories>
    fun findByCategoryAndEdition(category: Categories, edition: Edition): List<Subcategories>
    fun findByEdition_EditionId(editionId: Long): List<Subcategories>
    fun findBySubcategoryNameAndCategoryAndEdition(subcategoryName: String, category: Categories, edition: Edition): Optional<Subcategories>
    fun findByCategory(category: Categories): List<Subcategories>
    fun findByCategoryAndOrdinalNumber(category: Categories, ordinalNumber: Int): List<Subcategories>
    fun existsBySubcategoryNameAndCategory(subcategoryName: String, category: Categories): Boolean
    fun findByCategoryAndEdition_EditionId(category: Categories, editionId: Long): List<Subcategories>
    fun findAllByCategoryAndEdition(category: Categories, edition: Edition): List<Subcategories>
    fun findAllByCategoryAndEditionAndOrdinalNumberGreaterThanOrderByOrdinalNumberAsc(
        category: Categories,
        edition: Edition,
        ordinalNumber: Int
    ): List<Subcategories>
    fun findAllByEdition(edition: Edition): List<Subcategories>
}
