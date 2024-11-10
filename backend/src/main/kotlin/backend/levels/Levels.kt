package backend.levels

import backend.edition.Edition
import backend.files.FileEntity
import backend.gradingChecks.GradingChecks
import backend.levelSet.LevelSet
import backend.userLevel.UserLevel
import backend.utils.HasImageFile
import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "levels")
class Levels(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "level_id")
    val levelId: Long = 0,

    @Column(name = "name", nullable = false)
    var levelName: String,

    @Column(name = "minimum_points", nullable = false, precision = 10, scale = 2)
    var minimumPoints: BigDecimal,

    @Column(name = "maximum_points", nullable = false, precision = 10, scale = 2)
    var maximumPoints: BigDecimal,

    @Column(name = "grade", nullable = false, precision = 10, scale = 1)
    var grade: BigDecimal,

    @Column(name = "ordinal_number", nullable = false)
    var ordinalNumber: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_file_id")
    override var imageFile: FileEntity? = null,

    @Column(name = "highest", nullable = false)
    var highest: Boolean = false,

    @Column(name = "label", nullable = false, length = 256)
    var label: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "level_set_id", nullable = false)
    var levelSet: LevelSet,

    @OneToMany(mappedBy = "level", fetch = FetchType.LAZY)
    val userLevels: Set<UserLevel> = HashSet(),

    @OneToMany(mappedBy = "endOfLabsLevelsThreshold", fetch = FetchType.LAZY)
    val gradingChecks: Set<GradingChecks> = HashSet(),
) : HasImageFile {
    constructor() : this(
        levelName = "",
        minimumPoints = BigDecimal.ZERO,
        maximumPoints = BigDecimal.ZERO,
        grade = (2.0).toBigDecimal().setScale(1),
        label = "",
        levelSet = LevelSet()
    )
}
