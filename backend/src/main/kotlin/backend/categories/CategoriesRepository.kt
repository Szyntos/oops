package backend.categories

import backend.edition.Edition
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CategoriesRepository: JpaRepository<Categories, Long> {
    fun findAllByCategoryName(categoryName:String) : List<Categories>

    fun findByCategoryEdition_Edition(edition: Edition): List<Categories>
    fun findByCategoryEdition_EditionAndCanAddPoints(edition: Edition, canAddPoints: Boolean): List<Categories>
}
