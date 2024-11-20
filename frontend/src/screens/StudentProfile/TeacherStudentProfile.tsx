import { Styles } from "../../utils/Styles";
import { useParams } from "react-router-dom";
import {
  PointsForm,
  PointsFormValues,
} from "../../components/StudentProfile/PointsForm/PointsForm";
import { useUser } from "../../hooks/common/useUser";
import { useStudentProfileData } from "../../hooks/StudentProfile";
import { SideBar } from "../../components/StudentProfile/SideBar";
import { useFormCategories } from "../../hooks/common/useFormCategories";
import { Dialog } from "@mui/material";
import { StudentTableWithFilters } from "../../components/StudentProfile/table/StudentTableWithFilters";
import { Button } from "../../components/Button";
import { useTeacherActions } from "../../hooks/StudentProfile";
import { useEditionSelection } from "../../hooks/common/useEditionSelection";
import { isEditionActive } from "../../utils/utils";
import { NotEditableInfo } from "../../components/StudentProfile/NotEditableInfo";
import { CloseHeader } from "../../components/dialogs/CloseHeader";
import { UsersRolesType } from "../../__generated__/schema.graphql.types";
import { useCoordinatorActions } from "../../hooks/StudentProfile/useCoordinatorActions";
import { AddChestToUserForm } from "./AddChestToUserForm";

export function TeacherStudentProfile() {
  const params = useParams();
  const studentId = params.id;
  const { user } = useUser();
  const userId = user.userId;

  const { selectedEdition } = useEditionSelection();

  const {
    categories,
    studentData,
    points,
    sumOfAllPoints,
    prevLevel,
    currLevel,
    nextLevel,
    bonuses,
    filterHeaderNames,
    loading,
    error,
    refetch,
  } = useStudentProfileData(studentId);

  const {
    addPointsCategories,
    addChestCategories,
    addPointsFormInitialValues,
    loading: formDataLoading,
    error: formDataError,
  } = useFormCategories();

  const {
    selectedPoints,
    formError,
    isAddDialogOpen,
    openAddDialog,
    closeAddDialog,
    isEditDialogOpen,
    openEditDialog,
    closeEditDialog,
    handleAddPointsConfirmation,
    handleEditPointsConfirmation,
    handleDeletePointsClick,
  } = useTeacherActions(refetch, studentId as string, userId);

  const {
    chests,
    loading: chestsLoading,
    error: chestsError,
    isDialogOpen: isChestDialogOpen,
    closeAddDialog: closeChestDialog,
    openAddDialog: openChestDialog,
    handleAddChestConfirmation,
    formError: chestError,
  } = useCoordinatorActions(studentId as string, userId);

  if (!studentId) return <p>StudentId is undefined</p>;
  if (!userId) return <p>TeacherId is undefined</p>;

  if (loading || formDataLoading || chestsLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (formDataError) return <p>Error: {formDataError.message}</p>;
  if (chestsError) return <p>Error: {chestsError.message}</p>;

  if (!studentData) return <p>Student is undefined</p>;
  if (!currLevel) return <p>Curr level is undefined</p>;

  const hasEditableRights =
    studentData.group?.teacherId === userId ||
    user.role === UsersRolesType.Coordinator;

  const isSelectedEditionActive = Boolean(
    selectedEdition && isEditionActive(selectedEdition),
  );

  const disableEditMode = !(isSelectedEditionActive && hasEditableRights);

  const initialValues: PointsFormValues = selectedPoints
    ? {
        categoryId: selectedPoints?.subcategory.category.categoryId,
        points: parseFloat(selectedPoints.points.purePoints?.value ?? "0"),
        subcategoryId: selectedPoints?.subcategory.subcategoryId,
      }
    : addPointsFormInitialValues;

  return (
    <div style={styles.container}>
      <SideBar
        student={studentData}
        categoriesBarProps={categories}
        sumOfAllPoints={sumOfAllPoints}
        currLevel={currLevel}
        prevLevel={prevLevel}
        nextLevel={nextLevel}
        bonuses={bonuses}
      />
      <div style={styles.rightContainer}>
        {disableEditMode && (
          <NotEditableInfo
            hasEditableRights={hasEditableRights}
            isSelectedEditionActive={isSelectedEditionActive}
          />
        )}

        <div style={styles.buttonsContainer}>
          <Button
            onClick={openAddDialog}
            color="lightblue"
            disabled={disableEditMode}
          >
            Add Points
          </Button>
          {user.role === UsersRolesType.Coordinator && (
            <Button
              onClick={openChestDialog}
              color="lightblue"
              disabled={disableEditMode}
            >
              Add Chest
            </Button>
          )}
        </div>

        <StudentTableWithFilters
          points={points}
          filterHeaderNames={filterHeaderNames}
          editFunctions={{
            handleDeleteClick: handleDeletePointsClick,
            handleAddClick: openAddDialog,
            handleEditClick: openEditDialog,
          }}
          showActionButtons={true}
          blockActionButtons={disableEditMode}
        />

        <Dialog open={isAddDialogOpen}>
          <CloseHeader onCloseClick={closeAddDialog} />
          <PointsForm
            categories={addPointsCategories}
            handleConfirmClick={handleAddPointsConfirmation}
            mutationError={formError}
            variant="add"
            initialValues={initialValues}
            disableCategoryAndSubcategory={!!selectedPoints}
          />
        </Dialog>

        <Dialog open={isEditDialogOpen}>
          <CloseHeader onCloseClick={closeEditDialog} />
          <PointsForm
            categories={addPointsCategories}
            handleConfirmClick={handleEditPointsConfirmation}
            mutationError={formError}
            initialValues={initialValues}
            variant="edit"
            disableCategoryAndSubcategory={true}
          />
        </Dialog>

        <Dialog open={isChestDialogOpen}>
          <CloseHeader onCloseClick={closeChestDialog} />
          <AddChestToUserForm
            handleConfirmClick={handleAddChestConfirmation}
            categories={addChestCategories}
            chests={chests}
            initialValues={{
              categoryId: addChestCategories[0].id,
              subcategoryId: addChestCategories[0]?.subcategories[0].id,
              chestId: chests[0].chestId,
            }}
            formError={chestError}
          />
        </Dialog>
      </div>
    </div>
  );
}

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    gap: 20,
    margin: 12,
  },
  rightContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
