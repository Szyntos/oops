package backend.bonuses

import backend.award.Award
import backend.award.AwardType
import backend.chestHistory.ChestHistory
import backend.points.Points
import backend.points.PointsRepository
import backend.utils.TimestampModel
import jakarta.persistence.*
import java.math.BigDecimal
import java.math.RoundingMode
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
            throw IllegalArgumentException("Award type is not MULTIPLICATIVE")
        }
        if (points.subcategory.edition == null) {
            throw IllegalArgumentException("Points edition is null")
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

    fun updateAdditivePrevPoints(bonusRepository: BonusesRepository, pointsRepository: PointsRepository) {
        if (award.awardType != AwardType.ADDITIVE_PREV) {
            throw IllegalArgumentException("Award type is not ADDITIVE_NEXT")
        }
        if (points.subcategory.edition == null){
            throw IllegalArgumentException("Points edition is null")
        }
        val pointsInAwardCategory = points.student.getPointsByEditionAndCategory(
            points.subcategory.edition!!,
            award.category, pointsRepository).filter{
                point -> bonusRepository.findByPoints(point).isEmpty()
        }.sortedBy { it.subcategory.ordinalNumber }

        if (pointsInAwardCategory.isEmpty()) {
            points.value = BigDecimal.ZERO
            pointsRepository.save(points)
            return
        }

        var sum = 0f
        var i = pointsInAwardCategory.size - 1
        while (sum < award.awardValue.toFloat() || i >= 0) {
            val lastPoints = pointsInAwardCategory.getOrNull(i--)
                ?: break
            val pointsToAdd = min(award.awardValue.toFloat() - sum, lastPoints.subcategory.maxPoints.toFloat() - lastPoints.value.toFloat())
            sum += pointsToAdd
        }

        points.value = BigDecimal(sum.toString()).setScale(2, RoundingMode.HALF_UP)


        pointsRepository.save(points)
    }
}
