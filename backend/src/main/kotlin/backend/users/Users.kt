package backend.users

import UsersRolesConverter
import backend.award.Award
import backend.bonuses.BonusesRepository
import backend.categories.Categories
import backend.chestHistory.ChestHistory
import backend.edition.Edition
import backend.files.FileEntity
import backend.groups.Groups
import backend.points.Points
import backend.points.PointsRepository
import backend.pointsHistory.PointsHistory
import backend.userGroups.UserGroups
import backend.userLevel.UserLevel
import backend.utils.HasImageFile
import jakarta.persistence.*

@Entity
@Table(name = "users", uniqueConstraints = [UniqueConstraint(columnNames = ["index_number"])])
class Users(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    val userId: Long = 0,

    @Column(name = "index_number", nullable = false, unique = true)
    var indexNumber: Int,

    @Column(name = "nick", nullable = false)
    var nick: String,

    @Column(name = "first_name", nullable = false)
    var firstName:  String,

    @Column(name = "second_name", nullable = false)
    var secondName: String,

    @Column(name = "role", nullable = false)
    @Convert(converter = UsersRolesConverter::class)
    var role: UsersRoles,

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    val userGroups: Set<UserGroups> = HashSet(),

    @Column(name = "email", nullable = false, length = 256)
    var email: String,

    @Column(name = "firebase_uid", nullable = true, length = 256)
    var firebaseUid: String? = "",

    @Column(name = "active", nullable = false, length = 256)
    var active: Boolean = true,

    @Column(name = "label", nullable = false, length = 256)
    var label: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_file_id")
    override var imageFile: FileEntity? = null,

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    val userLevels: Set<UserLevel> = HashSet(),

    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    val points: Set<Points> = HashSet(),

    @OneToMany(mappedBy = "teacher", fetch = FetchType.LAZY)
    val pointsByTeacher: Set<Points> = HashSet(),

    @OneToMany(mappedBy = "updatedBy", fetch = FetchType.LAZY)
    val pointsByUpdatedBy: Set<Points> = HashSet(),

    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    val pointsHistory: Set<PointsHistory> = HashSet(),

    @OneToMany(mappedBy = "teacher", fetch = FetchType.LAZY)
    val pointsHistoryByTeacher: Set<PointsHistory> = HashSet(),

    @OneToMany(mappedBy = "teacher", fetch = FetchType.LAZY)
    val groups: Set<Groups> = HashSet(),

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    val chestHistory: Set<ChestHistory> = HashSet(),

    @OneToMany(mappedBy = "teacher", fetch = FetchType.LAZY)
    val chestHistoryByTeacher: Set<ChestHistory> = HashSet(),

    ) : HasImageFile {
    constructor() : this(
        indexNumber = 0,
        nick = "",
        firstName = "",
        secondName = "",
        role = UsersRoles.STUDENT,
        email = "",
        label = ""
    )
    fun getAwardUsageCount(award: Award, bonusRepository: BonusesRepository): Long {
        return bonusRepository.countByAwardAndPoints_Student(award, this)
    }

    fun getLevelByEdition(edition: Edition): UserLevel? {
        return userLevels.find { it.edition == edition }
    }

    fun getPointsByEditionAndCategory(
        edition: Edition,
        category: Categories,
        pointsRepository: PointsRepository,
    ): List<Points> {
        val allStudentPointsInEdition = pointsRepository.findAllByStudentAndSubcategory_Edition(this, edition)

        return allStudentPointsInEdition.filter {
            it.subcategory.category == category && it.subcategory.edition == edition
        }
    }

    fun getPointsBySubcategory(subcategoryId: Long, pointsRepository: PointsRepository): List<Points> {
        return pointsRepository.findAllByStudentAndSubcategory_SubcategoryId(this, subcategoryId)
    }
}
