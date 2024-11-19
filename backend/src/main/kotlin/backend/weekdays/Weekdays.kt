package backend.weekdays

import backend.groups.Groups
import backend.pointsHistory.PointsHistory
import jakarta.persistence.*

@Entity
@Table(name = "weekdays")
class Weekdays(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "weekday_id")
    val weekdayId: Long = 0,

    @Column(name = "weekday_name", nullable = false)
    var weekdayName: String,

    @Column(name = "weekday_abbr", nullable = false)
    var weekdayAbbr:  String,

    @Column(name = "ordinal_number", nullable = false)
    var ordinalNumber: Int = 1,

    @Column(name = "label", nullable = false, length = 256)
    var label: String,

    @OneToMany(mappedBy = "weekday", fetch = FetchType.LAZY)
    val groups: Set<Groups> = HashSet(),

    ) {
    constructor() : this(
        weekdayName = "",
        weekdayAbbr = "",
        ordinalNumber = 1,
        label = ""
    )
}
