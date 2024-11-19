package backend.groups

import backend.edition.Edition
import backend.files.FileEntity
import backend.userGroups.UserGroups
import backend.users.Users
import backend.utils.HasImageFile
import backend.weekdays.Weekdays
import jakarta.persistence.*
import java.sql.Time

@Entity
@Table(name = "groups")
class Groups(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "groups_id")
    val groupsId: Long = 0,

    @Column(name = "group_name", nullable = true)
    var groupName: String? = "",

    @Column(name = "generated_name", nullable = false)
    var generatedName: String,

    @Column(name = "usos_id", nullable = false)
    var usosId: Int,

    @Column(name = "label", nullable = true)
    var label: String? = "",

    @ManyToOne
    @JoinColumn(name = "teacher_id", referencedColumnName = "user_id", nullable = false)
    var teacher: Users,

    @OneToMany(mappedBy = "group", fetch = FetchType.LAZY)
    val userGroups: Set<UserGroups> = HashSet(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weekday_id", nullable = false)
    var weekday: Weekdays,

    @Column(name = "start_time", nullable = false)
    var startTime: Time,

    @Column(name = "end_time", nullable = false)
    var endTime: Time,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "edition_id", nullable = false)
    var edition: Edition,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_file_id")
    override var imageFile: FileEntity? = null
) : HasImageFile {
    constructor() : this(
        generatedName = "",
        usosId = 0,
        label = "",
        teacher = Users(),
        weekday = Weekdays(),
        startTime = Time(0),
        endTime = Time(0),
        edition = Edition()
    )
}
