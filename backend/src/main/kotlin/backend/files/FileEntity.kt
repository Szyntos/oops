package backend.files

import backend.award.Award
import backend.chests.Chests
import backend.groups.Groups
import backend.levels.Levels
import backend.subcategories.Subcategories
import backend.users.Users
import backend.utils.TimestampModel
import jakarta.persistence.*

@Entity
@Table(name = "files")
data class FileEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val fileId: Long = 0,

    @Column(name = "path_to_file", nullable = false, length = 1024)
    var pathToFile: String,

    @Column(name = "file_name", nullable = false, length = 255)
    var fileName: String,

    @Column(name = "file_type", nullable = false, length = 50)
    var fileType: String,

    @Column(name = "label", nullable = false, length = 256)
    var label: String = "",

    @OneToMany(mappedBy = "imageFile", fetch = FetchType.LAZY)
    val awards: Set<Award> = HashSet(),

    @OneToMany(mappedBy = "imageFile", fetch = FetchType.LAZY)
    val chests: Set<Chests> = HashSet(),

    @OneToMany(mappedBy = "imageFile", fetch = FetchType.LAZY)
    val groups: Set<Groups> = HashSet(),

    @OneToMany(mappedBy = "imageFile", fetch = FetchType.LAZY)
    val levels: Set<Levels> = HashSet(),

    @OneToMany(mappedBy = "imageFile", fetch = FetchType.LAZY)
    val users: Set<Users> = HashSet(),
) : TimestampModel() {
    constructor() : this(
        pathToFile = "",
        fileName = "",
        fileType = "",
        label = ""
    )
}
