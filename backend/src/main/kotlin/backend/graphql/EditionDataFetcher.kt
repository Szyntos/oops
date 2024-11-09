package backend.graphql

import backend.award.AwardRepository
import backend.bonuses.BonusesRepository
import backend.categories.CategoriesRepository
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.permissions.PermissionInput
import backend.graphql.permissions.PermissionService
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@DgsComponent
class EditionDataFetcher {
    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var bonusesRepository: BonusesRepository

    @Autowired
    lateinit var usersRepository: UsersRepository

    @Autowired
    lateinit var pointsRepository: PointsRepository

    @Autowired
    lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    lateinit var groupsRepository: GroupsRepository

    @Autowired
    lateinit var editionRepository: EditionRepository

    @Autowired
    lateinit var fileEntityRepository: FileEntityRepository

    @Autowired
    lateinit var awardRepository: AwardRepository

    @Autowired
    lateinit var photoAssigner: PhotoAssigner

    @DgsMutation
    @Transactional
    fun addEdition(@InputArgument editionName: String, @InputArgument editionYear: Int, @InputArgument label: String = ""): Edition {
        val action = "addEdition"
        val arguments = mapOf(
            "editionName" to editionName,
            "editionYear" to editionYear,
            "label" to label
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason)
        }

        val startDate = LocalDate.of(editionYear, 10, 1)
        val endDate = LocalDate.of(editionYear + 1, 9, 30)

        val edition = Edition(
            editionName = editionName,
            editionYear = editionYear,
            startDate = startDate,
            endDate = endDate,
            label = label)
        return editionRepository.save(edition)
    }

    @DgsMutation
    @Transactional
    fun editEdition(
        @InputArgument editionId: Long,
        @InputArgument editionName: String?,
        @InputArgument editionYear: Int?,
        @InputArgument label: String?
    ): Edition {
        val action = "editEdition"
        val arguments = mapOf(
            "editionId" to editionId,
            "editionName" to editionName,
            "editionYear" to editionYear,
            "label" to label
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason)
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }


        editionName?.let {
            edition.editionName = it
        }

        editionYear?.let {
            edition.editionYear = it
            edition.startDate = LocalDate.of(it, 10, 1)
            edition.endDate = LocalDate.of(it + 1, 9, 30)
        }

        label?.let {
            edition.label = it
        }

        return editionRepository.save(edition)
    }

    @DgsMutation
    @Transactional
    fun removeEdition(@InputArgument editionId: Long): Boolean {
        val action = "removeEdition"
        val arguments = mapOf(
            "editionId" to editionId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw IllegalArgumentException(permission.reason)
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }

        editionRepository.delete(edition)
        return true
    }
}
