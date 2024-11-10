package backend.graphql

import backend.categories.CategoriesRepository
import backend.edition.EditionRepository
import backend.files.FileEntityRepository
import backend.graphql.utils.PermissionDeniedException
import backend.graphql.utils.PermissionInput
import backend.graphql.utils.PermissionService
import backend.graphql.permissions.SubcategoriesPermissions
import backend.graphql.utils.PhotoAssigner
import backend.points.PointsRepository
import backend.subcategories.Subcategories
import backend.subcategories.SubcategoriesRepository
import backend.utils.UserMapper
import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsMutation
import com.netflix.graphql.dgs.InputArgument
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional
import java.math.RoundingMode

@DgsComponent
class SubcategoriesDataFetcher {
    @Autowired
    private lateinit var permissionService: PermissionService

    @Autowired
    private lateinit var subcategoriesPermissions: SubcategoriesPermissions

    @Autowired
    private lateinit var userMapper: UserMapper

    @Autowired
    private lateinit var subcategoriesRepository: SubcategoriesRepository

    @Autowired
    lateinit var editionRepository: EditionRepository

    @Autowired
    lateinit var categoriesRepository: CategoriesRepository

    @Autowired
    lateinit var fileEntityRepository: FileEntityRepository

    @Autowired
    lateinit var photoAssigner: PhotoAssigner

    @Autowired
    lateinit var pointsRepository: PointsRepository

    @DgsMutation
    @Transactional
    fun generateSubcategories(@InputArgument editionId: Long, @InputArgument categoryId: Long,
                              @InputArgument subcategoryPrefix: String,
                              @InputArgument subcategoryCount: Int, @InputArgument maxPoints: Float): List<Subcategories> {
        val action = "generateSubcategories"
        val arguments = mapOf(
            "editionId" to editionId,
            "categoryId" to categoryId,
            "subcategoryPrefix" to subcategoryPrefix,
            "subcategoryCount" to subcategoryCount,
            "maxPoints" to maxPoints
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val edition = editionRepository.findById(editionId).orElseThrow { throw Exception("Edition not found") }

        val category = categoriesRepository.findById(categoryId).orElseThrow { throw Exception("Category not found") }

        val subcategories = mutableListOf<Subcategories>()

        for (i in 0..<subcategoryCount) {
            val subcategory = Subcategories(
                subcategoryName = "${subcategoryPrefix}_$i",
                maxPoints = maxPoints.toBigDecimal().setScale(2, RoundingMode.HALF_UP),
                ordinalNumber = i,
                category = category,
                edition = edition,
                label = ""
            )
            subcategories.add(subcategory)
        }
        return subcategories
    }

    @DgsMutation
    @Transactional
    fun addSubcategory(@InputArgument subcategory: SubcategoryInput): Subcategories {
        val action = "addSubcategory"
        val subcategoryMap = mapOf(
            "subcategoryId" to subcategory.subcategoryId,
            "subcategoryName" to subcategory.subcategoryName,
            "maxPoints" to subcategory.maxPoints,
            "ordinalNumber" to subcategory.ordinalNumber,
            "categoryId" to subcategory.categoryId,
            "editionId" to subcategory.editionId,
            "label" to subcategory.label
        )
        val arguments = mapOf(
            "subcategory" to subcategoryMap
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        return addSubcategoryHelper(subcategory)
    }

    @DgsMutation
    @Transactional
    fun editSubcategory(
        @InputArgument subcategoryId: Long,
        @InputArgument subcategoryName: String?,
        @InputArgument maxPoints: Float?,
        @InputArgument ordinalNumber: Int?,
        @InputArgument label: String?
    ): Subcategories {
        val action = "editSubcategory"
        val arguments = mapOf(
            "subcategoryId" to subcategoryId,
            "subcategoryName" to subcategoryName,
            "maxPoints" to maxPoints,
            "ordinalNumber" to ordinalNumber,
            "label" to label
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }


        val subcategory = subcategoriesRepository.findById(subcategoryId)
            .orElseThrow { IllegalArgumentException("Subcategory not found") }





        subcategoryName?.let {
            subcategory.subcategoryName = it
        }

        maxPoints?.let {
            subcategory.maxPoints = it.toBigDecimal().setScale(2, RoundingMode.HALF_UP)
        }

        ordinalNumber?.let {
            subcategory.ordinalNumber = it
        }

        label?.let {
            subcategory.label = it
        }

        return subcategoriesRepository.save(subcategory)

    }

    @DgsMutation
    @Transactional
    fun removeSubcategory(@InputArgument subcategoryId: Long): Boolean {
        val action = "removeSubcategory"
        val arguments = mapOf(
            "subcategoryId" to subcategoryId
        )
        val permissionInput = PermissionInput(
            action = action,
            arguments = objectMapper.writeValueAsString(arguments)
        )
        val permission = permissionService.checkFullPermission(permissionInput)

        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val subcategory = subcategoriesRepository.findById(subcategoryId)
            .orElseThrow { IllegalArgumentException("Subcategory not found") }

        subcategoriesRepository.delete(subcategory)
        return true
    }

    @Transactional
    fun addSubcategoryHelper(subcategory: SubcategoryInput): Subcategories {
        val permission = subcategoriesPermissions.checkAddSubcategoryHelperPermission(subcategory)
        if (!permission.allow) {
            throw PermissionDeniedException(permission.reason ?: "Permission denied", permission.stackTrace)
        }

        val category = categoriesRepository.findById(subcategory.categoryId!!).orElseThrow { throw Exception("Category not found") }
        val edition = if (!(subcategory.editionId == -1L || subcategory.editionId == null)) {
            editionRepository.findById(subcategory.editionId).orElseThrow { throw Exception("Edition not found") }
        } else {
            null
        }
        val subcategories = Subcategories(
            subcategoryName = subcategory.subcategoryName,
            maxPoints = subcategory.maxPoints.toBigDecimal().setScale(2, RoundingMode.HALF_UP),
            ordinalNumber = subcategory.ordinalNumber,
            category = category,
            edition = edition,
            label = subcategory.label
        )
        return subcategoriesRepository.save(subcategories)
    }
}

data class SubcategoryInput(
    val subcategoryId: Long? = -1,
    val subcategoryName: String,
    val maxPoints: Float,
    val ordinalNumber: Int,
    var categoryId: Long? = -1,
    val editionId: Long? = -1,
    val label: String
)
