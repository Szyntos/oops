package backend.graphql

import backend.award.AwardRepository
import backend.awardEdition.AwardEdition
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.edition.EditionRepository
import backend.graphql.permissions.AwardEditionPermissions
import backend.graphql.utils.PermissionDeniedException
import backend.graphql.utils.PermissionInput
import backend.graphql.utils.PermissionService
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
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
    private lateinit var awardEditionPermissions: AwardEditionPermissions

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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }
        return addAwardToEditionHelper(awardId, editionId)
    }

    @Transactional
    fun addAwardToEditionHelper(awardId: Long, editionId: Long): AwardEdition {
        val permission = awardEditionPermissions.checkAddAwardToEditionHelperPermission(awardId, editionId)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val award = awardRepository.findById(awardId).orElseThrow { throw IllegalArgumentException("Nie znaleziono Łupu o id $awardId") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Nie znaleziono Edycji o id $editionId") }

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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }
        return removeAwardFromEditionHelper(awardId, editionId)
    }

    @Transactional
    fun removeAwardFromEditionHelper(awardId: Long, editionId: Long): Boolean {
        val permission = awardEditionPermissions.checkRemoveAwardFromEditionHelperPermission(awardId, editionId)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val award = awardRepository.findById(awardId).orElseThrow { throw IllegalArgumentException("Nie znaleziono Łupu o id $awardId") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Nie znaleziono Edycji o id $editionId") }

        awardEditionRepository.deleteByAwardAndEdition(award, edition)
        return true
    }
}
