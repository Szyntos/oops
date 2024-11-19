package backend.chestHistory

import backend.bonuses.Bonuses
import backend.bonuses.BonusesRepository
import backend.chests.Chests
import backend.subcategories.Subcategories
import backend.userLevel.UserLevel
import backend.users.Users
import backend.utils.TimestampModel
import jakarta.persistence.*

@Entity
@Table(name = "chest_history")
class ChestHistory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chest_history_id")
    val chestHistoryId: Long = 0,

    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "user_id")
    var user: Users,

    @ManyToOne
    @JoinColumn(name = "teacher_id", referencedColumnName = "user_id")
    var teacher: Users,

    @ManyToOne
    @JoinColumn(name = "chest_id", referencedColumnName = "chest_id")
    var chest: Chests,

    @ManyToOne
    @JoinColumn(name = "subcategory_id", referencedColumnName = "subcategory_id")
    var subcategory: Subcategories,

    @Column(name = "label", nullable = false, length = 256)
    var label: String,

    @Column(name = "opened", nullable = false)
    var opened: Boolean = false,

    @OneToMany(mappedBy = "chestHistory", fetch = FetchType.LAZY)
    val bonuses: Set<Bonuses> = HashSet(),

    ): TimestampModel() {
    constructor() : this(
        user = Users(),
        teacher = Users(),
        chest = Chests(),
        subcategory = Subcategories(),
        label = ""
    )

    fun hasExistingBonus(bonusRepository: BonusesRepository): Boolean {
        val existingBonuses = bonusRepository.findByChestHistory(this)
        return existingBonuses.isNotEmpty()
    }
}
