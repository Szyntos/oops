package backend.graphql

import backend.award.AwardRepository
import backend.awardEdition.AwardEditionRepository
import backend.bonuses.BonusesRepository
import backend.categories.Categories
import backend.categories.CategoriesRepository
import backend.chests.ChestsRepository
import backend.edition.Edition
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.gradingChecks.GradingChecks
import backend.gradingChecks.GradingChecksRepository
import backend.graphql.utils.*
import backend.groups.GroupsRepository
import backend.levels.Levels
import backend.points.PointsRepository
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRepository
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import kotlin.jvm.optionals.getOrNull

@DgsComponent
class EditionDataFetcher {
    @Autowired
    private lateinit var gradingChecksDataFetcher: GradingChecksDataFetcher

    @Autowired
    private lateinit var gradingChecksRepository: GradingChecksRepository

    @Autowired
    private lateinit var permissionService: PermissionService

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

    @DgsQuery
    @Transactional
    fun listSetupEditions(): List<EditionWithPermissions>{
        val action = "listSetupEditions"
        val arguments = mapOf<String, Any>()
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val editions = editionRepository.findAll()
        return editions.map {
            EditionWithPermissions(
                edition = it,
                permissions =  ListPermissionsOutput(
                    canAdd = Permission(
                        "addEdition",
                        objectMapper.createObjectNode(),
                        false,
                        "Nie dotyczy"),
                    canEdit = permissionService.checkPartialPermission(PermissionInput("editEdition", objectMapper.writeValueAsString(mapOf("editionId" to it.editionId)))),
                    canCopy = permissionService.checkPartialPermission(PermissionInput("copyEdition", objectMapper.writeValueAsString(mapOf("editionId" to it.editionId)))),
                    canRemove = permissionService.checkPartialPermission(PermissionInput("removeEdition", objectMapper.writeValueAsString(mapOf("editionId" to it.editionId)))),
                    canSelect =
                    Permission(
                        "selectEdition",
                        objectMapper.createObjectNode(),
                        false,
                        "Nie dotyczy"),
                    canUnselect =
                    Permission(
                        "unselectEdition",
                        objectMapper.createObjectNode(),
                        false,
                        "Nie dotyczy"),
                    additional = emptyList()
                )
            )
        }.sortedBy { it.edition.editionYear }
    }

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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono edycji o id $editionId") }


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
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono edycji o id $editionId") }


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

        val gradingCheck = gradingChecksRepository.findByEdition(edition).getOrNull()
        if (gradingCheck != null){
            gradingChecksDataFetcher.removeGradingCheckHelper(gradingCheck.gradingCheckId)
        }

        editionRepository.delete(edition)
        return true
    }

    @DgsMutation
    @Transactional
    fun copyEdition(@InputArgument editionId: Long, @InputArgument editionYear: Int, @InputArgument editionName: String): Edition {
        val action = "copyEdition"
        val arguments = mapOf(
            "editionId" to editionId,
            "editionYear" to editionYear,
            "editionName" to editionName
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Brak dostępu", permission.stackTrace)
        }

        val edition = editionRepository.findById(editionId)
            .orElseThrow { IllegalArgumentException("Nie znaleziono edycji o id $editionId") }

        val startDate = LocalDate.of(editionYear, 10, 1)
        val endDate = LocalDate.of(editionYear + 1, 9, 30)

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

        val gradingCheck = gradingChecksRepository.findByEdition(edition).getOrNull()

        if (gradingCheck != null){
            val newEndOfLabsDate = gradingCheck.endOfLabsDate.withYear(
                editionYear + gradingCheck.endOfLabsDate.year - edition.editionYear
            )

            val newGradingCheck = GradingChecks(
                endOfLabsDate = newEndOfLabsDate,
                endOfLabsLevelsThreshold = gradingCheck.endOfLabsLevelsThreshold,
                projectPointsThreshold = gradingCheck.projectPointsThreshold,
                project = gradingCheck.project,
                edition = resultEdition
            )
            gradingChecksRepository.save(newGradingCheck)
        }

        return resultEdition
    }
}

data class EditionWithPermissions(
    val edition: Edition,
    val permissions: ListPermissionsOutput
)
