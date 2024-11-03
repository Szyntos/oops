package backend.graphql

import backend.award.AwardRepository
import backend.awardEdition.AwardEdition
import backend.awardEdition.AwardEditionRepository
import backend.categories.CategoriesRepository
import backend.categoryEdition.CategoryEdition
import backend.categoryEdition.CategoryEditionRepository
import backend.chestAward.ChestAwardRepository
import backend.chestEdition.ChestEdition
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.Chests
import backend.chests.ChestsRepository
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
class ChestEditionDataFetcher {

    @Autowired
    private lateinit var awardEditionRepository: AwardEditionRepository

    @Autowired
    private lateinit var chestHistoryRepository: ChestHistoryRepository

    @Autowired
    private lateinit var chestAwardRepository: ChestAwardRepository

    @Autowired
    private lateinit var chestEditionRepository: ChestEditionRepository

    @Autowired
    private lateinit var chestsRepository: ChestsRepository

    @Autowired
    private lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var categoryEditionRepository: CategoryEditionRepository

    @Autowired
    lateinit var editionRepository: EditionRepository

    @Autowired
    lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    lateinit var subcategoriesDataFetcher: SubcategoriesDataFetcher

    @DgsMutation
    @Transactional
    fun addChestToEdition(@InputArgument chestId: Long, @InputArgument editionId: Long): ChestEdition {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can add chests to editions")
        }

        val chest = chestsRepository.findById(chestId).orElseThrow { throw IllegalArgumentException("Chest not found") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Edition not found") }

        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }

        if (chestEditionRepository.existsByChest_ChestTypeAndEdition(chest.chestType, edition)){
            throw IllegalArgumentException("Chest with this type already exists in this edition")
        }

        val awardsInChest = chestAwardRepository.findByChest(chest).map { it.award }

        if (awardsInChest.any {award -> !awardEditionRepository.existsByAwardAndEdition(award, edition)}){
            throw IllegalArgumentException("Not all awards in this chest are available in this edition")
        }


        val chestEdition = ChestEdition(
            chest = chest,
            edition = edition,
            label = ""
        )

        val resultChestEdition = chestEditionRepository.save(chestEdition)


        return resultChestEdition
    }

    @DgsMutation
    @Transactional
    fun removeChestFromEdition(@InputArgument chestId: Long, @InputArgument editionId: Long): Boolean {
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            throw IllegalArgumentException("Only coordinators can remove chests from editions")
        }

        val chest = chestsRepository.findById(chestId).orElseThrow { throw IllegalArgumentException("Chest not found") }
        val edition = editionRepository.findById(editionId).orElseThrow { throw IllegalArgumentException("Edition not found") }

        if (!chestEditionRepository.existsByChestAndEdition(chest, edition)){
            throw IllegalArgumentException("This chest does not exist in this edition")
        }

        if (edition.endDate.isBefore(java.time.LocalDate.now())){
            throw IllegalArgumentException("Edition has already ended")
        }

        if (edition.startDate.isBefore(java.time.LocalDate.now()) && chestHistoryRepository.existsByChestAndSubcategory_Edition(chest, edition)){
            throw IllegalArgumentException("Users have already been given this chest in this edition")
        }

        chestEditionRepository.deleteByChestAndEdition(chest, edition)
        return true
    }
}
