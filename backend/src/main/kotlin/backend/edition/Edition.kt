package backend.edition

import backend.categoryEdition.CategoryEdition
import backend.chestEdition.ChestEdition
import backend.userLevel.UserLevel
import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "edition")
class Edition(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "edition_id", nullable = false)
    val editionId: Long = 0,

    @Column(name = "name", nullable = false, length = 256)
    var editionName: String,

    @Column(name = "edition_year", nullable = false)
    var editionYear: Int,

    @Column(name = "label", nullable = false, length = 256)
    var label: String,

    @Column(name = "start_date", nullable = false)
    var startDate: LocalDate,

    @Column(name = "end_date", nullable = false)
    var endDate: LocalDate,

    @OneToMany(mappedBy = "edition", fetch = FetchType.LAZY)
    val userLevels: Set<UserLevel> = HashSet(),

    @OneToMany(mappedBy = "edition", fetch = FetchType.LAZY)
    val categoryEdition: Set<CategoryEdition> = HashSet(),

    @OneToMany(mappedBy = "edition", fetch = FetchType.LAZY)
    val chestEdition: Set<ChestEdition> = HashSet(),
) {
    constructor() : this(
        editionName = "",
        editionYear = 0,
        startDate = LocalDate.now(),
        endDate = LocalDate.now(),
        label = ""
    )
}
