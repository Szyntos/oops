package backend.pointsHistory

import backend.subcategories.Subcategories
import backend.users.Users
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "points_history")
class PointsHistory(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "points_history_id", updatable = false) // Updated to reflect unique ID for the point history record
    val pointsHistoryId: Long = 0,

    @Column(name = "points_id", nullable = false, updatable = false) // Points ID from the original points table
    var pointsId: Long,

    @ManyToOne
    @JoinColumn(name = "student_id", referencedColumnName = "user_id", updatable = false)
    var student: Users,

    @ManyToOne
    @JoinColumn(name = "teacher_id", referencedColumnName = "user_id", updatable = false)
    var teacher: Users,

    @Column(name = "value", nullable = false, updatable = false)
    var value: Float,

    @ManyToOne
    @JoinColumn(name = "subcategory_id", referencedColumnName = "subcategory_id", updatable = false)
    var subcategory: Subcategories,

    @Column(name = "label", nullable = false, length = 256, updatable = false)
    var label: String,

    @Column(name = "created_at", nullable = false, updatable = false) // Copied from points table
    var createdAt: LocalDateTime,

    @Column(name = "updated_at", nullable = false, updatable = false) // Copied from points table
    var updatedAt: LocalDateTime,

    @Column(name = "copied_at", nullable = false, updatable = false) // Timestamp when the history record was created
    var copiedAt: LocalDateTime = LocalDateTime.now()
) {
    constructor() : this(
        pointsId = 0,
        student = Users(),
        teacher = Users(),
        value = 0f,
        subcategory = Subcategories(),
        label = "",
        createdAt = LocalDateTime.now(), // Placeholder values, actual values should be set from original points data
        updatedAt = LocalDateTime.now(),
        copiedAt = LocalDateTime.now()
    )
}