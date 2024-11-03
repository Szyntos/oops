package backend.levelSet

import backend.edition.Edition
import backend.levels.Levels
import jakarta.persistence.*

@Entity
@Table(name = "level_sets")
class LevelSet(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "level_set_id", nullable = false)
    val levelSetId: Long = 0,

    @Column(name = "level_set_name", nullable = false, length = 255)
    var levelSetName: String,

    @OneToMany(mappedBy = "levelSet", fetch = FetchType.LAZY)
    val edition: Set<Edition> = HashSet(),

    @OneToMany(mappedBy = "levelSet", fetch = FetchType.LAZY)
    var levels: Set<Levels> = HashSet()
) {
    constructor() : this(levelSetName = "")
}
