package backend.chestEdition

import backend.categories.Categories
import backend.chests.Chests
import backend.edition.Edition
import jakarta.persistence.*

@Entity
@Table(name = "chest_edition")
class ChestEdition(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chest_edition_id")
    val chestEditionId: Long = 0,

    @ManyToOne
    @JoinColumn(name = "chest_id", referencedColumnName = "chest_id")
    var chest: Chests,

    @ManyToOne
    @JoinColumn(name = "edition_id", referencedColumnName = "edition_id")
    var edition: Edition,

    @Column(name = "label", nullable = false, length = 256)
    var label: String,
) {
    constructor() : this(
        chest = Chests(),
        edition = Edition(),
        label = ""
    )
}
