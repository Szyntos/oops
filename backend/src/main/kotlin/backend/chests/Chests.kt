package backend.chests

import backend.categoryEdition.CategoryEdition
import backend.chestEdition.ChestEdition
import backend.edition.Edition
import backend.files.FileEntity
import backend.utils.HasImageFile
import jakarta.persistence.*

@Entity
@Table(name = "chests")
class Chests(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chest_id")
    val chestId: Long = 0,

    @Column(name = "type", nullable = false)
    var chestType: String,

    @Column(name="active", nullable = false)
    var active: Boolean = true,

    @Column(name = "award_bundle_count", nullable = false)
    var awardBundleCount: Int,

    @Column(name = "label", nullable = false, length = 256)
    var label: String,

    @OneToMany(mappedBy = "chest", fetch = FetchType.LAZY)
    val chestEdition: Set<ChestEdition> = HashSet(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_file_id")
    override var imageFile: FileEntity? = null,
) : HasImageFile {
    constructor() : this(
        chestType = "",
        awardBundleCount = 0,
        label = "",
    )
}
