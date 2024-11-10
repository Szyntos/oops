package backend.categories

import backend.award.Award
import backend.categoryEdition.CategoryEdition
import backend.gradingChecks.GradingChecks
import backend.subcategories.Subcategories
import backend.userLevel.UserLevel
import jakarta.persistence.*

@Entity
@Table(name = "categories")
class Categories(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    val categoryId: Long = 0,

    @Column(name = "category_name", nullable = false, length = 256)
    var categoryName: String,

    @Column(name = "can_add_points", nullable = false)
    var canAddPoints: Boolean = true,

    @Column(name = "label", nullable = false, length = 256)
    var label: String,

    @Column(name = "light_color", nullable = false, length = 7)
    var lightColor: String,

    @Column(name = "dark_color", nullable = false, length = 7)
    var darkColor: String,

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    val categoryEdition: Set<CategoryEdition> = HashSet(),

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    val subcategories: Set<Subcategories> = HashSet(),

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    val awards: Set<Award> = HashSet(),

    @OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
    val gradingChecks: Set<GradingChecks> = HashSet(),
) {
    constructor() : this(
        categoryName = "LABORATORY",
        lightColor = "#FFFFFF",
        darkColor = "#000000",
        label = ""
    )
}
