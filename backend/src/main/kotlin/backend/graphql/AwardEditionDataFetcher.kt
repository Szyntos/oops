package backend.graphql

import backend.award.AwardRepository
import backend.awardEdition.AwardEdition
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.edition.EditionRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class AwardEditionDataFetcher {

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var awardEditionRepository: AwardEditionRepository

    @Autowired
    lateinit var pointsRepository: PointsRepository

    @Autowired
    lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    lateinit var editionRepository: EditionRepository

    @Autowired
    lateinit var awardRepository: AwardRepository

    @Autowired
    lateinit var bonusesRepository: BonusesRepository

    @DgsMutation
    @Transactional
    fun addAwardToEdition(@InputArgument awardId: Long, @InputArgument editionId: Long): AwardEdition {
        return addAwardToEditionHelper(awardId, editionId)
    }

    @DgsMutation
    @Transactional
    fun removeAwardFromEdition(@InputArgument awardId: Long, @InputArgument editionId: Long): Boolean {
        return removeAwardFromEditionHelper(awardId, editionId)
    }

    @Transactional
    fun addAwardToEditionHelper(awardId: Long, editionId: Long): AwardEdition {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can add awards to editions")
        }

        val award = awardRepository.findById(awardId).orElseThrow { throw IllegalArgumentException("Award not found") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Edition not found") }

        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }

        if (awardEditionRepository.existsByAward_AwardNameAndEdition(award.awardName, edition)){
            throw IllegalArgumentException("Award with this name already exists in this edition")
        }

        if (award.category.categoryEdition.none { it.edition == edition }) {
            throw IllegalArgumentException("Award's category does not exist in this edition")
        }

        val awardEdition = AwardEdition(
            award = award,
            edition = edition,
            label = ""
        )
        return awardEditionRepository.save(awardEdition)
    }

    @Transactional
    fun removeAwardFromEditionHelper(awardId: Long, editionId: Long): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can remove awards from editions")
        }

        val award = awardRepository.findById(awardId).orElseThrow { throw IllegalArgumentException("Award not found") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Edition not found") }

        if (!awardEditionRepository.existsByAwardAndEdition(award, edition)){
            throw IllegalArgumentException("This award does not exist in this edition")
        }

        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }

        if (bonusesRepository.existsByAwardAndPoints_Subcategory_Edition(award, edition)){
            throw IllegalArgumentException("Award has already been assigned to students in this edition")
        }

        awardEditionRepository.deleteByAwardAndEdition(award, edition)
        return true
    }
}
