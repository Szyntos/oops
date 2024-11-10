package backend.graphql.permissions

import com.fasterxml.jackson.databind.JsonNode
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class PermissionService {

    @Autowired
    private lateinit var levelsPermissions: LevelsPermissions

    @Autowired
    private lateinit var usersPermissions: UsersPermissions

    @Autowired
    private lateinit var groupsPermissions: GroupsPermissions

    @Autowired
    private lateinit var gradingChecksPermissions: GradingChecksPermissions

    @Autowired
    private lateinit var filePermissions: FilePermissions

    @Autowired
    private lateinit var editionPermissions: EditionPermissions

    @Autowired
    private lateinit var chestsAwardPermissions: ChestsAwardPermissions

    @Autowired
    private lateinit var chestHistoryPermissions: ChestHistoryPermissions

    @Autowired
    private lateinit var chestEditionPermissions: ChestEditionPermissions

    @Autowired
    private lateinit var categoryEditionPermissions: CategoryEditionPermissions

    @Autowired
    private lateinit var subcategoriesPermissions: SubcategoriesPermissions

    @Autowired
    private lateinit var categoriesPermissions: CategoriesPermissions

    @Autowired
    private lateinit var bonusPermissions: BonusPermissions

    @Autowired
    private lateinit var awardsPermissions: AwardsPermissions

    @Autowired
    private lateinit var awardEditionPermissions: AwardEditionPermissions

    @Autowired
    private lateinit var chestsPermissions: ChestsPermissions

    fun checkFullPermission(input: PermissionInput): Permission {
        val jsonArguments = objectMapper.readTree(input.arguments)
        return when (input.action) {
            // AwardEditionPermissions
            "addAwardToEdition" -> awardEditionPermissions.checkAddAwardToEditionPermission(jsonArguments)
            "removeAwardFromEdition" -> awardEditionPermissions.checkRemoveAwardFromEditionPermission(jsonArguments)
            // AwardsPermissions
            "assignPhotoToAward" -> awardsPermissions.checkAssignPhotoToAwardPermission(jsonArguments)
            "addAward" -> awardsPermissions.checkAddAwardPermission(jsonArguments)
            "editAward" -> awardsPermissions.checkEditAwardPermission(jsonArguments)
            "removeAward" -> awardsPermissions.checkRemoveAwardPermission(jsonArguments)
            "copyAward" -> awardsPermissions.checkCopyAwardPermission(jsonArguments)
            // BonusPermissions
            "addBonus" -> bonusPermissions.checkAddBonusPermission(jsonArguments)
            // CategoriesPermissions
            "addCategory" -> categoriesPermissions.checkAddCategoryPermission(jsonArguments)
            "editCategory" -> categoriesPermissions.checkEditCategoryPermission(jsonArguments)
            "removeCategory" -> categoriesPermissions.checkRemoveCategoryPermission(jsonArguments)
            // CategoryEditionPermissions
            "addCategoryToEdition" -> categoryEditionPermissions.checkAddCategoryToEditionPermission(jsonArguments)
            "removeCategoryFromEdition" -> categoryEditionPermissions.checkRemoveCategoryFromEditionPermission(jsonArguments)
            // ChestEditionPermissions
            "addChestToEdition" -> chestEditionPermissions.checkAddChestToEditionPermission(jsonArguments)
            "removeChestFromEdition" -> chestEditionPermissions.checkRemoveChestFromEditionPermission(jsonArguments)
            // ChestHistoryPermissions
            "addChestToUser" -> chestHistoryPermissions.checkAddChestToUserPermission(jsonArguments)
            "editChestHistory" -> chestHistoryPermissions.checkEditChestHistoryPermission(jsonArguments)
            "removeChestFromUser" -> chestHistoryPermissions.checkRemoveChestFromUserPermission(jsonArguments)
            // ChestsAwardPermissions
            "addAwardToChest" -> chestsAwardPermissions.checkAddAwardToChestPermission(jsonArguments)
            "removeAwardFromChest" -> chestsAwardPermissions.checkRemoveAwardFromChestPermission(jsonArguments)
            // ChestsPermissions
            "assignPhotoToChest" -> chestsPermissions.checkAssignPhotoToChestPermission(jsonArguments)
            "addChest" -> chestsPermissions.checkAddChestPermission(jsonArguments)
            "editChest" -> chestsPermissions.checkEditChestPermission(jsonArguments)
            "removeChest" -> chestsPermissions.checkRemoveChestPermission(jsonArguments)
            "copyChest" -> chestsPermissions.checkCopyChestPermission(jsonArguments)
            // EditionPermissions
            "addEdition" -> editionPermissions.checkAddEditionPermission(jsonArguments)
            "editEdition" -> editionPermissions.checkEditEditionPermission(jsonArguments)
            "removeEdition" -> editionPermissions.checkRemoveEditionPermission(jsonArguments)
            // FilePermissions
            "getFilesGroupedByType" -> filePermissions.checkGetFilesGroupedByTypePermission(jsonArguments)
            "getFilesGroupedByTypeBySelectedTypes" -> filePermissions.checkGetFilesGroupedByTypeBySelectedTypesPermission(jsonArguments)
            // GradingChecksPermissions
            "addGradingCheck" -> gradingChecksPermissions.checkAddGradingCheckPermission(jsonArguments)
            "editGradingCheck" -> gradingChecksPermissions.checkEditGradingCheckPermission(jsonArguments)
            "removeGradingCheck" -> gradingChecksPermissions.checkRemoveGradingCheckPermission(jsonArguments)
            // GroupsPermissions
            "assignPhotosToGroups" -> groupsPermissions.checkAssignPhotosToGroupsPermission(jsonArguments)
            "addGroup" -> groupsPermissions.checkAddGroupPermission(jsonArguments)
            "addGroupWithUsers" -> groupsPermissions.checkAddGroupWithUsersPermission(jsonArguments)
            "editGroup" -> groupsPermissions.checkEditGroupPermission(jsonArguments)
            "editGroupWithUsers" -> groupsPermissions.checkEditGroupWithUsersPermission(jsonArguments)
            "removeGroup" -> groupsPermissions.checkRemoveGroupPermission(jsonArguments)
            "getPossibleGroupsWeekdays" -> groupsPermissions.checkGetPossibleGroupsWeekdaysPermission(jsonArguments)
            "getPossibleGroupsTimeSpans" -> groupsPermissions.checkGetPossibleGroupsTimeSpansPermission(jsonArguments)
            "getPossibleGroupDates" -> groupsPermissions.checkGetPossibleGroupDatesPermission(jsonArguments)
            "getUsersInGroupWithPoints" -> groupsPermissions.checkGetUsersInGroupWithPointsPermission(jsonArguments)
            "getGroupsInEdition" -> groupsPermissions.checkGetGroupsInEditionPermission(jsonArguments)
            // LevelsPermissions
            "assignPhotoToLevel" -> levelsPermissions.checkAssignPhotoToLevelPermission(jsonArguments)
            "getNeighboringLevels" -> levelsPermissions.checkGetNeighboringLevelsPermission(jsonArguments)
            // SubcategoriesPermissions
            "addSubcategory" -> subcategoriesPermissions.checkAddSubcategoryPermission(jsonArguments)
            "editSubcategory" -> subcategoriesPermissions.checkEditSubcategoryPermission(jsonArguments)
            "removeSubcategory" -> subcategoriesPermissions.checkRemoveSubcategoryPermission(jsonArguments)
            "generateSubcategories" -> subcategoriesPermissions.checkGenerateSubcategoriesPermission(jsonArguments)
            // UsersPermissions
            "assignPhotoToUser" -> usersPermissions.checkAssignPhotoToUserPermission(jsonArguments)
            "addUser" -> usersPermissions.checkAddUserPermission(jsonArguments)
            "addTeacher" -> usersPermissions.checkAddTeacherPermission(jsonArguments)
            "parseUsersFromCsv" -> usersPermissions.checkParseUsersFromCsvPermission(jsonArguments)
            "validateUsersToBeAdded" -> usersPermissions.checkValidateUsersToBeAddedPermission(jsonArguments)
            "editUser" -> usersPermissions.checkEditUserPermission(jsonArguments)
            "removeUser" -> usersPermissions.checkRemoveUserPermission(jsonArguments)
            "resetPassword" -> usersPermissions.checkResetPasswordPermission(jsonArguments)
            "getStudentPoints" -> usersPermissions.checkGetStudentPointsPermission(jsonArguments)
            "getSumOfPointsForStudentByCategory" -> usersPermissions.checkGetSumOfPointsForStudentByCategoryPermission(jsonArguments)
            "getCurrentUser" -> usersPermissions.checkGetCurrentUserPermission(jsonArguments)

            else -> Permission(
                action = input.action,
                arguments = jsonArguments,
                allow = false,
                reason = "Unknown action '${input.action}'"
            )
        }
    }

    fun checkPartialPermission(input: PermissionInput): Permission {
        val jsonArguments = objectMapper.readTree(input.arguments)
        return Permission(
            action = input.action,
            arguments = jsonArguments,
            allow = false,
            reason = "Unknown action '${input.action}'"
        )
    }
}

class PermissionDeniedException(message: String) : Exception(message)

data class PermissionInput(
    val action: String,
    val arguments: String
)

data class Permission(
    val action: String,
    val arguments: JsonNode,
    val allow: Boolean,
    val reason: String?
)

