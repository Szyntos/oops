package backend.award

import backend.awardEdition.AwardEdition
import backend.categories.Categories
import backend.chestEdition.ChestEdition
import backend.files.FileEntity
import backend.utils.HasImageFile
import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "award")
class Award (
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        @Column(name = "award_id", nullable = false)
        val awardId: Long = 0,

        @Column(name = "award_name", nullable = false)
        var awardName: String,

        @Column(name="award_type", nullable = false)
        @Convert(converter = AwardTypeConverter::class)
        var awardType: AwardType,

        @Column(name="award_value", nullable = false, precision = 10, scale = 2)
        var awardValue: BigDecimal,

        @ManyToOne
        @JoinColumn(name = "category_id", referencedColumnName = "category_id")
        var category: Categories,

        @Column(name = "max_usages", nullable = false)
        var maxUsages: Int,

        @OneToMany(mappedBy = "award", fetch = FetchType.LAZY, cascade = [CascadeType.ALL], orphanRemoval = true)
        val awardEditions: Set<AwardEdition> = HashSet(),

        @Column(name = "description", nullable = false)
        var description: String,

        @Column(name = "label", nullable = false, length = 256)
        var label: String,

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "image_file_id")
        override var imageFile: FileEntity? = null,
) : HasImageFile {
        constructor() : this(
                awardName = "",
                awardType = AwardType.ADDITIVE,
                awardValue = BigDecimal.ONE,
                category = Categories(),
                maxUsages = 1,
                description = "",
                label = ""
        )
}
