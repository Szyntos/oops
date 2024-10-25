package backend.files

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
) : TimestampModel() {
    constructor() : this(
        pathToFile = "",
        fileName = "",
        fileType = "",
        label = ""
    )
}
