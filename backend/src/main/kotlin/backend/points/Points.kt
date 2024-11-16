package backend.points

import backend.bonuses.Bonuses
import backend.gradingChecks.GradingChecks
import backend.subcategories.Subcategories
import backend.users.Users
import backend.utils.TimestampModel
import jakarta.persistence.*
import java.math.BigDecimal

@Entity
@Table(name = "points")
class Points(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "points_id")
    val pointsId: Long = 0,

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "user_id")
    var student: Users,

    @ManyToOne
    @JoinColumn(name = "teacher_id", referencedColumnName = "user_id")
    var teacher: Users,

    @ManyToOne
    @JoinColumn(name = "updated_by", referencedColumnName = "user_id")
    var updatedBy: Users,

    @Column(name = "value", nullable = false, precision = 10, scale = 2)
    var value: BigDecimal,

    @ManyToOne
    @JoinColumn(name = "subcategory_id", referencedColumnName = "subcategory_id")
    var subcategory: Subcategories,

    @Column(name = "label", nullable = false, length = 256)
    var label: String,

    @OneToOne(mappedBy = "points", fetch = FetchType.LAZY)
    val bonuses: Bonuses? = null,
) : TimestampModel(){
    constructor() : this(
        student = Users(),
        teacher = Users(),
        updatedBy = Users(),
        value = BigDecimal.ZERO,
        subcategory = Subcategories(),
        label = ""
    )
}


data class PointsInput(
    val student: Long,
    val teacher: Long,
    val value: Float,
    val subcategory: Long
)
