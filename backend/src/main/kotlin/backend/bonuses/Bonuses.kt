package backend.bonuses

import backend.award.Award
import backend.award.AwardType
import backend.chestHistory.ChestHistory
import backend.edition.Edition
import backend.points.Points
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.utils.TimestampModel
import jakarta.persistence.*
import java.math.BigDecimal
import java.math.RoundingMode
import kotlin.math.max
import kotlin.math.min

@Entity
@Table(name = "bonuses")
class Bonuses(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bonus_id")
    val bonusId: Long = 0,

    @OneToOne
    @JoinColumn(name = "points_id", referencedColumnName = "points_id")
    var points: Points,

    @ManyToOne
    @JoinColumn(name = "award_id", referencedColumnName = "award_id")
    var award: Award,

    @ManyToOne
    @JoinColumn(name = "chest_history_id", referencedColumnName = "chest_history_id", nullable = false)
    var chestHistory: ChestHistory,

    @Column(name = "label", nullable = false, length = 256)
    var label: String,

) : TimestampModel(){
    constructor() : this(
        points = Points(),
        award = Award(),
        chestHistory = ChestHistory(),
        label = ""
    )

    fun updateMultiplicativePoints(bonusRepository: BonusesRepository, pointsRepository: PointsRepository) {
        if (award.awardType != AwardType.MULTIPLICATIVE) {
            throw IllegalArgumentException("Typ Łupu nie jest MULTIPLICATIVE")
        }
        if (points.subcategory.edition == null) {
            throw IllegalArgumentException("Edycja punktów jest nullem")
        }
        val pointsInAwardCategory = points.student.getPointsByEditionAndCategory(
            points.subcategory.edition!!,
            award.category, pointsRepository).filter{
                point -> bonusRepository.findByPoints(point).isEmpty()
        }
        if (pointsInAwardCategory.isEmpty()) {
            points.value = BigDecimal.ZERO
            pointsRepository.save(points)
            return
        }
        val totalPointsValue = pointsInAwardCategory.sumOf { it.value.toDouble() }.toFloat()
        points.value = (totalPointsValue * award.awardValue.toFloat()).toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        pointsRepository.save(points)
    }

    fun updateAdditivePrevPoints(subcategoriesRepository: SubcategoriesRepository, bonusRepository: BonusesRepository, pointsRepository: PointsRepository, edition: Edition, updatedBonuses: List<Points>): Points {
        if (award.awardType != AwardType.ADDITIVE_PREV) {
            throw IllegalArgumentException("Typ Łupu nie jest ADDITIVE_PREV")
        }
        if (points.subcategory.edition == null){
            throw IllegalArgumentException("Edycja punktów jest nullem")
        }

        val purePointsInAwardCategory = chestHistory.user.getPointsByEditionAndCategory(edition, award.category, pointsRepository)
            .sortedBy { it.subcategory.ordinalNumber }
            .filter { point -> bonusRepository.findByPoints(point).isEmpty()}

        val sumOfPurePointsInAwardCategory = purePointsInAwardCategory.sumOf { it.value.toDouble() }.toFloat()

        val sumOfUpdatedBonuses = updatedBonuses.sumOf { it.value.toDouble() }.toFloat()

        val allSubcategoriesInAwardCategory = subcategoriesRepository.findAllByCategoryAndEdition(award.category, edition)

        val maxPoints = allSubcategoriesInAwardCategory.sumOf { it.maxPoints.toDouble() }.toFloat()

        val freeSpace = maxPoints - sumOfPurePointsInAwardCategory - sumOfUpdatedBonuses

        val pointsToAdd = max(min(award.awardValue.toFloat(), freeSpace), 0f)

        points.value = pointsToAdd.toBigDecimal().setScale(2, RoundingMode.HALF_UP)

        return pointsRepository.save(points)
    }
}
