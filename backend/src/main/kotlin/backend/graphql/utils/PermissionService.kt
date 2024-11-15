package backend.graphql.utils

import backend.graphql.partialPermissions.*
import backend.graphql.permissions.*
import com.fasterxml.jackson.databind.JsonNode
import com.google.api.services.storage.Storage.Objects.Copy
import com.netflix.graphql.dgs.internal.BaseDgsQueryExecutor.objectMapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class PermissionService {

    @Autowired
    private lateinit var usersPartialPermissions: UsersPartialPermissions

    @Autowired
    private lateinit var levelSetPartialPermissions: LevelSetPartialPermissions

    @Autowired
    private lateinit var groupsPartialPermissions: GroupsPartialPermissions

    @Autowired
    private lateinit var chestsPartialPermissions: ChestsPartialPermissions

    @Autowired
    private lateinit var chestEditionPartialPermissions: ChestEditionPartialPermissions

    @Autowired
    private lateinit var awardEditionPartialPermissions: AwardEditionPartialPermissions

    @Autowired
    private lateinit var awardsPartialPermissions: AwardsPartialPermissions

    @Autowired
    private lateinit var categoriesPartialPermissions: CategoriesPartialPermissions

    @Autowired
    private lateinit var categoryEditionPartialPermissions: CategoryEditionPartialPermissions

    @Autowired
    private lateinit var userGroupsPermissions: UserGroupsPermissions

    @Autowired
    private lateinit var pointsPermissions: PointsPermissions

    @Autowired
    private lateinit var permissionPermissions: PermissionPermissions

    @Autowired
    private lateinit var levelSetPermissions: LevelSetPermissions

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
            "listSetupAwards" -> awardsPermissions.checkListSetupAwardsPermission(jsonArguments)
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
            "copyCategory" -> categoriesPermissions.checkCopyCategoryPermission(jsonArguments)
            "listSetupCategories" -> categoriesPermissions.checkListSetupCategoriesPermission(jsonArguments)
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
            "listSetupChests" -> chestsPermissions.checkListSetupChestsPermission(jsonArguments)
            "assignPhotoToChest" -> chestsPermissions.checkAssignPhotoToChestPermission(jsonArguments)
            "addChest" -> chestsPermissions.checkAddChestPermission(jsonArguments)
            "editChest" -> chestsPermissions.checkEditChestPermission(jsonArguments)
            "removeChest" -> chestsPermissions.checkRemoveChestPermission(jsonArguments)
            "copyChest" -> chestsPermissions.checkCopyChestPermission(jsonArguments)
            // EditionPermissions
            "addEdition" -> editionPermissions.checkAddEditionPermission(jsonArguments)
            "editEdition" -> editionPermissions.checkEditEditionPermission(jsonArguments)
            "copyEdition" -> editionPermissions.checkCopyEditionPermission(jsonArguments)
            "removeEdition" -> editionPermissions.checkRemoveEditionPermission(jsonArguments)
            // FilePermissions
            "getFilesGroupedByType" -> filePermissions.checkGetFilesGroupedByTypePermission(jsonArguments)
            "getFilesGroupedByTypeBySelectedTypes" -> filePermissions.checkGetFilesGroupedByTypeBySelectedTypesPermission(jsonArguments)
            // GradingChecksPermissions
            "listSetupGradingChecks" -> gradingChecksPermissions.checkListSetupGradingChecksPermission(jsonArguments)
            "addGradingCheck" -> gradingChecksPermissions.checkAddGradingCheckPermission(jsonArguments)
            "editGradingCheck" -> gradingChecksPermissions.checkEditGradingCheckPermission(jsonArguments)
            "removeGradingCheck" -> gradingChecksPermissions.checkRemoveGradingCheckPermission(jsonArguments)
            // GroupsPermissions
            "listSetupGroups" -> groupsPermissions.checkListSetupGroupsPermission(jsonArguments)
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
            // LevelSetPermissions
            "listSetupLevelSets" -> levelSetPermissions.checkListSetupLevelSetsPermission(jsonArguments)
            "addLevelSet" -> levelSetPermissions.checkAddLevelSetPermission(jsonArguments)
            "editLevelSet" -> levelSetPermissions.checkEditLevelSetPermission(jsonArguments)
            "removeLevelSet" -> levelSetPermissions.checkRemoveLevelSetPermission(jsonArguments)
            "copyLevelSet" -> levelSetPermissions.checkCopyLevelSetPermission(jsonArguments)
            "addLevelSetToEdition" -> levelSetPermissions.checkAddLevelSetToEditionPermission(jsonArguments)
            "removeLevelSetFromEdition" -> levelSetPermissions.checkRemoveLevelSetFromEditionPermission(jsonArguments)
            // PermissionPermissions
            "checkFullPermission" -> permissionPermissions.checkCheckFullPermissionPermission(jsonArguments)
            "checkPartialPermission" -> permissionPermissions.checkCheckPartialPermissionPermission(jsonArguments)
            // PointsPermissions
            "addPoints" -> pointsPermissions.checkAddPointsPermission(jsonArguments)
            "editPoints" -> pointsPermissions.checkEditPointsPermission(jsonArguments)
            "removePoints" -> pointsPermissions.checkRemovePointsPermission(jsonArguments)
            "addPointsToGroup" -> pointsPermissions.checkAddPointsToGroupPermission(jsonArguments)
            // SubcategoriesPermissions
            "addSubcategory" -> subcategoriesPermissions.checkAddSubcategoryPermission(jsonArguments)
            "editSubcategory" -> subcategoriesPermissions.checkEditSubcategoryPermission(jsonArguments)
            "removeSubcategory" -> subcategoriesPermissions.checkRemoveSubcategoryPermission(jsonArguments)
            "generateSubcategories" -> subcategoriesPermissions.checkGenerateSubcategoriesPermission(jsonArguments)
            // UserGroupsPermissions
            "addUserToGroup" -> userGroupsPermissions.checkAddUserToGroupPermission(jsonArguments)
            "removeUserFromGroup" -> userGroupsPermissions.checkRemoveUserFromGroupPermission(jsonArguments)
            "changeStudentGroup" -> userGroupsPermissions.checkChangeStudentGroupPermission(jsonArguments)
            // UsersPermissions
            "listSetupUsers" -> usersPermissions.checkListSetupUsersPermission(jsonArguments)
            "assignPhotoToUser" -> usersPermissions.checkAssignPhotoToUserPermission(jsonArguments)
            "addUser" -> usersPermissions.checkAddUserPermission(jsonArguments)
            "addTeacher" -> usersPermissions.checkAddTeacherPermission(jsonArguments)
            "parseUsersFromCsv" -> usersPermissions.checkParseUsersFromCsvPermission(jsonArguments)
            "validateUsersToBeAdded" -> usersPermissions.checkValidateUsersToBeAddedPermission(jsonArguments)
            "editUser" -> usersPermissions.checkEditUserPermission(jsonArguments)
            "removeUser" -> usersPermissions.checkRemoveUserPermission(jsonArguments)
            "resetPassword" -> usersPermissions.checkResetPasswordPermission(jsonArguments)
            "markPassingStudentsFromEditionAsInactive" -> usersPermissions.checkMarkPassingStudentsFromEditionAsInactivePermission(jsonArguments)
            "markStudentAsInactive" -> usersPermissions.checkMarkStudentAsInactivePermission(jsonArguments)
            "markStudentAsActive" -> usersPermissions.checkMarkStudentAsActivePermission(jsonArguments)
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
        return when (input.action) {
            // AwardsPermissions
            "editAward" -> awardsPartialPermissions.checkEditAwardPermission(jsonArguments)
            "removeAward" -> awardsPartialPermissions.checkRemoveAwardPermission(jsonArguments)
            "copyAward" -> awardsPartialPermissions.checkCopyAwardPermission(jsonArguments)
            // AwardEditionPermissions
            "addAwardToEdition" -> awardEditionPartialPermissions.checkAddAwardToEditionPermission(jsonArguments)
            "removeAwardFromEdition" -> awardEditionPartialPermissions.checkRemoveAwardFromEditionPermission(jsonArguments)
            // CategoryEditionPermissions
            "addCategoryToEdition" -> categoryEditionPartialPermissions.checkAddCategoryToEditionPermission(jsonArguments)
            "removeCategoryFromEdition" -> categoryEditionPartialPermissions.checkRemoveCategoryFromEditionPermission(jsonArguments)
            // CategoriesPermissions
            "editCategory" -> categoriesPartialPermissions.checkEditCategoryPermission(jsonArguments)
            "removeCategory" -> categoriesPartialPermissions.checkRemoveCategoryPermission(jsonArguments)
            "copyCategory" -> categoriesPartialPermissions.checkCopyCategoryPermission(jsonArguments)
            // ChestEditionPermissions
            "addChestToEdition" -> chestEditionPartialPermissions.checkAddChestToEditionPermission(jsonArguments)
            "removeChestFromEdition" -> chestEditionPartialPermissions.checkRemoveChestFromEditionPermission(jsonArguments)
            // ChestsPermissions
            "editChest" -> chestsPartialPermissions.checkEditChestPermission(jsonArguments)
            "removeChest" -> chestsPartialPermissions.checkRemoveChestPermission(jsonArguments)
            "copyChest" -> chestsPartialPermissions.checkCopyChestPermission(jsonArguments)
            // GradingChecksPermissions
            "editGradingCheck" -> gradingChecksPermissions.checkEditGradingCheckPermission(jsonArguments)
            // GroupsPermissions
            "editGroupWithUsers" -> groupsPartialPermissions.checkEditGroupWithUsersPermission(jsonArguments)
            "removeGroup" -> groupsPartialPermissions.checkRemoveGroupPermission(jsonArguments)
            // LevelSetPermissions
            "editLevelSet" -> levelSetPartialPermissions.checkEditLevelSetPermission(jsonArguments)
            "removeLevelSet" -> levelSetPartialPermissions.checkRemoveLevelSetPermission(jsonArguments)
            "copyLevelSet" -> levelSetPartialPermissions.checkCopyLevelSetPermission(jsonArguments)
            "addLevelSetToEdition" -> levelSetPartialPermissions.checkAddLevelSetToEditionPermission(jsonArguments)
            "removeLevelSetFromEdition" -> levelSetPartialPermissions.checkRemoveLevelSetFromEditionPermission(jsonArguments)
            // UsersPermissions
            "removeUser" -> usersPartialPermissions.checkRemoveUserPermission(jsonArguments)
            "editUser" -> usersPartialPermissions.checkEditUserPermission(jsonArguments)
            else -> Permission(
                action = input.action,
                arguments = jsonArguments,
                allow = false,
                reason = "Unknown action '${input.action}'"
            )
        }
    }
}

class PermissionDeniedException(
    message: String,
    val stackTraceInfo: String
) : IllegalArgumentException(message)


data class PermissionInput(
    val action: String,
    val arguments: String
)

data class Permission(
    val action: String,
    val arguments: JsonNode,
    val allow: Boolean,
    val reason: String?,
    val stackTrace: String = Thread.currentThread().stackTrace.take(15).joinToString("\n")
)

data class ListPermissionsOutput(
    val canAdd: Permission,
    val canEdit: Permission,
    val canCopy: Permission,
    val canRemove: Permission,
    val canSelect: Permission,
    val canUnselect: Permission,
    val additional: List<Permission>
)
