package backend.chests

import backend.chestAward.ChestAward
import backend.chestEdition.ChestEdition
import backend.chestHistory.ChestHistory
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

    @Column(name = "award_bundle_count", nullable = false)
    var awardBundleCount: Int,

    @Column(name = "label", nullable = false, length = 256)
    var label: String,

    @OneToMany(mappedBy = "chest", fetch = FetchType.LAZY)
    val chestEdition: Set<ChestEdition> = HashSet(),

    @OneToMany(mappedBy = "chest", fetch = FetchType.LAZY)
    val chestAward: Set<ChestAward> = HashSet(),

    @OneToMany(mappedBy = "chest", fetch = FetchType.LAZY)
    val chestHistory: Set<ChestHistory> = HashSet(),

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
