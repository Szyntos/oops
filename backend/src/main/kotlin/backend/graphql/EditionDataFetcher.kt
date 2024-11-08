package backend.graphql

import backend.award.AwardRepository
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.categories.CategoriesRepository
import backend.chests.ChestsRepository
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
    private lateinit var groupsDataFetcher: GroupsDataFetcher

    @Autowired
    private lateinit var chestsRepository: ChestsRepository

    @Autowired
    private lateinit var awardEditionDataFetcher: AwardEditionDataFetcher

    @Autowired
    private lateinit var chestEditionDataFetcher: ChestEditionDataFetcher

    @Autowired
    private lateinit var awardEditionRepository: AwardEditionRepository

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

    @Autowired
    lateinit var categoryEditionDataFetcher: CategoryEditionDataFetcher

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

        val categories = categoriesRepository.findByCategoryEdition_Edition(edition)
        categories.forEach {
            categoryEditionDataFetcher.removeCategoryFromEditionHelper(it.categoryId, edition.editionId)
        }

        val awards = awardRepository.findByAwardEditions_Edition(edition)

        awards.forEach {
            awardEditionDataFetcher.removeAwardFromEditionHelper(it.awardId, edition.editionId)
        }

        val chests = chestsRepository.findByChestEdition_Edition(edition)

        chests.forEach {
            chestEditionDataFetcher.removeChestFromEditionHelper(it.chestId, edition.editionId)
        }

        val groups = groupsRepository.findByEdition(edition)

        groups.forEach {
            groupsDataFetcher.removeGroupHelper(it.groupsId)
        }

        editionRepository.delete(edition)
        return true
    }

    @DgsMutation
    @Transactional
    fun copyEdition(@InputArgument editionId: Long, @InputArgument editionYear: Int): Edition {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR) {
            throw IllegalArgumentException("Only coordinators can copy editions")
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Invalid edition ID") }

        val currentYear = LocalDate.now().year

        if (editionYear < currentYear-1 || editionYear > currentYear + 10) {
            throw IllegalArgumentException("Edition year must be between ${currentYear-1} and ${currentYear + 10}")
        }

        if (editionRepository.existsByEditionYear(editionYear)) {
            throw IllegalArgumentException("Edition with year $editionYear already exists")
        }
        val startDate = LocalDate.of(editionYear, 10, 1)
        val endDate = LocalDate.of(editionYear + 1, 9, 30)

        val editionNameRoot = edition.editionName
        var i = 1
        while (editionRepository.findAllByEditionName("$editionNameRoot (Copy $i)").isNotEmpty()) {
            i++
        }
        val editionName = "$editionNameRoot (Copy $i)"

        val newEdition = Edition(
            editionName = editionName,
            editionYear = editionYear,
            startDate = startDate,
            endDate = endDate,
            label = edition.label)
        newEdition.levelSet = edition.levelSet
        val resultEdition = editionRepository.save(newEdition)

        val categories = categoriesRepository.findByCategoryEdition_Edition(edition)
        categories.forEach {
            categoryEditionDataFetcher.addCategoryToEditionHelper(it.categoryId, resultEdition.editionId)
        }

        val awards = awardRepository.findByAwardEditions_Edition(edition)

        awards.forEach {
            awardEditionDataFetcher.addAwardToEditionHelper(it.awardId, resultEdition.editionId)
        }

        val chests = chestsRepository.findByChestEdition_Edition(edition)

        chests.forEach {
            chestEditionDataFetcher.addChestToEditionHelper(it.chestId, resultEdition.editionId)
        }

        return resultEdition
    }
}
