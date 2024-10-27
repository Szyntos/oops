package backend.graphql

import backend.award.AwardRepository
import backend.bonuses.BonusesRepository
import backend.categories.CategoriesRepository
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.groups.GroupsRepository
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.users.UsersRoles
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@DgsComponent
class EditionDataFetcher {
    @Autowired
    lateinit var userMapper: UserMapper

    @Autowired
    lateinit var bonusesRepository: BonusesRepository

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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can add editions")
        }

        if (editionRepository.existsByEditionName(editionName)) {
            throw IllegalArgumentException("Edition with name $editionName already exists")
        }
        if (editionRepository.existsByEditionYear(editionYear)) {
            throw IllegalArgumentException("Edition with year $editionYear already exists")
        }

        val currentYear = LocalDate.now().year

        if (editionYear < currentYear-1 || editionYear > currentYear + 10) {
            throw IllegalArgumentException("Edition year must be between ${currentYear-1} and ${currentYear + 10}")
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can edit editions")
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }

        if (edition.endDate.isBefore(LocalDate.now())) {
            throw IllegalArgumentException("Edition has already ended")
        }
        if (edition.startDate.isBefore(LocalDate.now())) {
            throw IllegalArgumentException("Edition has already started")
        }

        editionName?.let {
            if (editionRepository.existsByEditionName(it) && it != edition.editionName) {
                throw IllegalArgumentException("Edition with name $it already exists")
            }
            edition.editionName = it
        }

        editionYear?.let {
            val currentYear = LocalDate.now().year
            if (it < currentYear || it > currentYear + 10) {
                throw IllegalArgumentException("Edition year must be between $currentYear and ${currentYear + 10}")
            }
            if (editionRepository.existsByEditionYear(it) && it != edition.editionYear) {
                throw IllegalArgumentException("Edition with year $it already exists")
            }
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
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can remove editions")
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }

        if (edition.endDate.isBefore(LocalDate.now())) {
            throw IllegalArgumentException("Edition has already ended")
        }
        if (edition.startDate.isBefore(LocalDate.now())) {
            throw IllegalArgumentException("Edition has already started")
        }

        editionRepository.delete(edition)
        return true
    }
}
