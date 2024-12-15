package backend.graphql.permissions

import backend.award.AwardRepository
import backend.categories.CategoriesRepository
import backend.chestEdition.ChestEditionRepository
import backend.chestHistory.ChestHistoryRepository
import backend.chests.ChestsRepository
import backend.edition.EditionRepository
import backend.graphql.utils.PhotoAssigner
import backend.graphql.SubcategoryInput
import backend.graphql.utils.Permission
import backend.points.PointsRepository
import backend.subcategories.Subcategories
import backend.subcategories.SubcategoriesRepository
import backend.users.UsersRoles
import backend.utils.JsonNodeExtensions.getFloatField
import backend.utils.JsonNodeExtensions.getIntField
import backend.utils.JsonNodeExtensions.getLongField
import backend.utils.JsonNodeExtensions.getStringField
import backend.utils.JsonNodeExtensions.getSubcategoryInput
import backend.utils.UserMapper
import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.math.RoundingMode
import java.time.LocalDate
import kotlin.jvm.optionals.getOrNull

@Service
class SubcategoriesPermissions {

    @Autowired
    private lateinit var pointsRepository: PointsRepository

    @Autowired
    private lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    private lateinit var editionRepository: EditionRepository

    @Autowired
    private lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    private lateinit var awardRepository: AwardRepository

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var chestsRepository: ChestsRepository

    @Autowired
    private lateinit var chestEditionRepository: ChestEditionRepository

    @Autowired
    private lateinit var chestHistoryRepository: ChestHistoryRepository

    @Autowired
    private lateinit var photoAssigner: PhotoAssigner

    fun checkGenerateSubcategoriesPermission(arguments: JsonNode): Permission {
        val action = "generateSubcategories"

        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can generate subcategories"
            )
        }

        val editionId = arguments.getLongField("editionId")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'editionId'"
        )
        val categoryId = arguments.getLongField("categoryId")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'categoryId'"
        )

        val subcategoryPrefix = arguments.getStringField("subcategoryPrefix")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'subcategoryPrefix'"
        )

        val subcategoryCount = arguments.getIntField("subcategoryCount")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'subcategoryCount'"
        )

        val maxPoints = arguments.getFloatField("maxPoints")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'maxPoints'"
        )

        val edition = editionRepository.findById(editionId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition with id $editionId not found"
            )
        if (edition.endDate.isBefore(LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Edition has already ended"
            )
        }
        val category = categoriesRepository.findById(categoryId).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category with id $categoryId not found"
            )
        if (category.categoryEdition.none { it.edition == edition }) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category with id $categoryId does not exist in edition with id $editionId"
            )
        }
        if (subcategoriesRepository.findByCategoryAndEdition(category, edition).isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategories for category with id $categoryId and edition with id $editionId already exist"
            )
        }
        val subcategories = mutableListOf<Subcategories>()
        if (subcategoryCount < 1) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory count must be greater than 0"
            )
        }
        if (maxPoints < 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Max points must be greater than or equal to 0"
            )
        }
        if (subcategoryPrefix.isBlank()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory prefix must not be blank"
            )
        }
        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddSubcategoryPermission(arguments: JsonNode): Permission {
        val action = "addSubcategory"
        val subcategory = arguments.getSubcategoryInput("subcategory")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'subcategory'"
        )

        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add subcategories"
            )
        }

        val permission = checkAddSubcategoryHelperPermission(subcategory)
        if (!permission.allow) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = permission.reason
            )
        }
        return Permission(
            action = action,
            arguments = arguments,
            allow = permission.allow,
            reason = permission.reason
        )
    }

    fun checkEditSubcategoryPermission(arguments: JsonNode): Permission {
        val action = "editSubcategory"
        val subcategoryId = arguments.getLongField("subcategoryId")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'subcategoryId'"
        )

        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can edit subcategories"
            )
        }

        val subcategoryName = arguments.getStringField("subcategoryName")

        val maxPoints = arguments.getFloatField("maxPoints")

        val ordinalNumber = arguments.getIntField("ordinalNumber")



        val subcategory = subcategoriesRepository.findById(subcategoryId)
            .getOrNull() ?: return Permission(
                                action = action,
                                arguments = arguments,
                                allow = false,
                                reason = "Subcategory with id $subcategoryId not found"
                                )

        if (subcategory.edition == null){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory's edition is null"
            )
        }

        if (subcategory.edition?.endDate?.isBefore(java.time.LocalDate.now()) == true){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory's edition has already ended"
            )
        }


        subcategoryName?.let {
            if (it.isBlank()) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Subcategory name must not be blank"
                )
            }
            if (subcategoriesRepository.findBySubcategoryNameAndCategoryAndEdition(it, subcategory.category,
                    subcategory.edition!!
                ).isPresent) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Subcategory with name $it already exists in the same category and edition"
                )
            }
            subcategory.subcategoryName = it
        }

        maxPoints?.let {
            if (subcategory.edition!!.startDate.isBefore(java.time.LocalDate.now())){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Subcategory's edition has already started"
                )
            }
            if (it < 0) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Max points must be greater than or equal to 0"
                )
            }
            subcategory.maxPoints = it.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        ordinalNumber?.let {
            if (subcategory.edition!!.startDate.isBefore(java.time.LocalDate.now())){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Subcategory's edition has already started"
                )
            }
            if (it < 0) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Ordinal number must be greater or equal to 0"
                )
            }
            val ordinalNumbers = subcategoriesRepository.findByCategoryAndEdition(subcategory.category,
                subcategory.edition!!
            ).map { it.ordinalNumber }

            if (ordinalNumbers.contains(it) && it != subcategory.ordinalNumber) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Subcategory with ordinal number $it already exists"
                )
            }
            if (ordinalNumbers.isEmpty() && it != 0) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "First subcategory must have ordinal number 0"
                )
            }
            subcategory.ordinalNumber = it
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkRemoveSubcategoryPermission(arguments: JsonNode): Permission {
        val action = "removeSubcategory"
        val subcategoryId = arguments.getLongField("subcategoryId")?: return Permission(
            action = action,
            arguments = arguments,
            allow = false,
            reason = "Invalid or missing 'subcategoryId'"
        )

        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can remove subcategories"
            )
        }

        val subcategory = subcategoriesRepository.findById(subcategoryId)
            .getOrNull() ?: return Permission(
                                action = action,
                                arguments = arguments,
                                allow = false,
                                reason = "Subcategory with id $subcategoryId not found"
                                )

        if (subcategory.edition != null && subcategory.edition!!.endDate.isBefore(java.time.LocalDate.now())){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory's edition has already ended"
            )
        }
        if (pointsRepository.findBySubcategory(subcategory).isNotEmpty()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory has points"
            )
        }

        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }

    fun checkAddSubcategoryHelperPermission(subcategory: SubcategoryInput): Permission {
        val action = "addSubcategoryHelper"
        val arguments = objectMapper.valueToTree<JsonNode>(mapOf(
            "subcategory" to mapOf(
                "subcategoryId" to subcategory.subcategoryId,
                "subcategoryName" to subcategory.subcategoryName,
                "maxPoints" to subcategory.maxPoints,
                "ordinalNumber" to subcategory.ordinalNumber,
                "categoryId" to subcategory.categoryId,
                "editionId" to subcategory.editionId,
                "label" to subcategory.label
            )
        ))
        val currentUser = userMapper.getCurrentUser()
        if (currentUser.role != UsersRoles.COORDINATOR){
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Only coordinators can add subcategories"
            )
        }

        if (subcategory.subcategoryId != null && subcategory.subcategoryId != -1L) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "You cannot specify subcategoryId when adding a new subcategory"
            )
        }
        if (subcategory.categoryId == -1L || subcategory.categoryId == null) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category ID must be specified"
            )
        }
        val category = categoriesRepository.findById(subcategory.categoryId!!).getOrNull()
            ?: return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Category with id ${subcategory.categoryId} not found"
            )

        val edition = if (!(subcategory.editionId == -1L || subcategory.editionId == null)) {
            val edition = editionRepository.findById(subcategory.editionId).getOrNull()
                ?: return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition with id ${subcategory.editionId} not found"
                )

            if (edition.endDate.isBefore(LocalDate.now())){
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Edition has already ended"
                )
            }
            if (category.categoryEdition.none { it.edition == edition }) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Category with id ${subcategory.categoryId} does not exist in edition with id ${subcategory.editionId}"
                )
            }
            if (subcategoriesRepository.findBySubcategoryNameAndCategoryAndEdition(subcategory.subcategoryName, category, edition).isPresent) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Subcategory with name ${subcategory.subcategoryName} already exists in category with id ${subcategory.categoryId} and edition with id ${subcategory.editionId}"
                )
            }
            edition
        } else {
            if (subcategoriesRepository.existsBySubcategoryNameAndCategory(subcategory.subcategoryName, category)) {
                return Permission(
                    action = action,
                    arguments = arguments,
                    allow = false,
                    reason = "Subcategory with name ${subcategory.subcategoryName} already exists in category with id ${subcategory.categoryId}"
                )
            }
            null
        }
        val ordinalNumbers = if (edition != null) {
            subcategoriesRepository.findByCategoryAndEdition(category, edition).map { it.ordinalNumber }
        } else {
            subcategoriesRepository.findByCategory(category).map { it.ordinalNumber }
        }
        if (subcategory.subcategoryName.isBlank()) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory name must not be blank"
            )
        }
        if (subcategory.maxPoints < 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Max points must be greater than or equal to 0"
            )
        }
        if (subcategory.ordinalNumber < 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Ordinal number must be greater or equal to 0"
            )
        }
        if (ordinalNumbers.contains(subcategory.ordinalNumber)) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Subcategory with ordinal number ${subcategory.ordinalNumber} already exists"
            )
        }
        if (ordinalNumbers.isEmpty() && subcategory.ordinalNumber != 0) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "First subcategory must have ordinal number 0"
            )
        }
        if (ordinalNumbers.isNotEmpty() && ordinalNumbers.max() != subcategory.ordinalNumber - 1) {
            return Permission(
                action = action,
                arguments = arguments,
                allow = false,
                reason = "Ordinal number must be greater by 1 than the previous subcategory-(${ordinalNumbers.max()})"
            )
        }
        return Permission(
            action = action,
            arguments = arguments,
            allow = true,
            reason = null
        )
    }
}