package backend.graphql

import backend.award.AwardRepository
import backend.awardEdition.AwardEdition
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.edition.EditionRepository
import backend.graphql.permissions.PermissionInput
import backend.graphql.permissions.PermissionService
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@DgsComponent
class AwardEditionDataFetcher {

    @Autowired
    private lateinit var permissionService: PermissionService

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
        val arguments = mapOf("awardId" to awardId, "editionId" to editionId)

        val permissionInput = PermissionInput(
            action = "addAwardToEdition",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }

        val award = awardRepository.findById(awardId).orElseThrow { throw IllegalArgumentException("Award not found") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Edition not found") }

        val awardEdition = AwardEdition(
            award = award,
            edition = edition,
            label = ""
        )
        return awardEditionRepository.save(awardEdition)
    }

    @DgsMutation
    @Transactional
    fun removeAwardFromEdition(@InputArgument awardId: Long, @InputArgument editionId: Long): Boolean {
        val arguments = mapOf("awardId" to awardId, "editionId" to editionId)

        val permissionInput = PermissionInput(
            action = "removeAwardFromEdition",
            arguments = objectMapper.writeValueAsString(arguments)
        )

        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason ?: "Permission denied")
        }

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
