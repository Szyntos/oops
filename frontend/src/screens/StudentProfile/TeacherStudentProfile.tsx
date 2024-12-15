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
import { useTeacherActions } from "../../hooks/StudentProfile";
import { useEditionSelection } from "../../hooks/common/useEditionSelection";
import { isEditionActive } from "../../utils/utils";
import { NotEditableInfo } from "../../components/StudentProfile/NotEditableInfo";
import { CloseHeader } from "../../components/dialogs/CloseHeader";
import { UsersRolesType } from "../../__generated__/schema.graphql.types";
import { useCoordinatorActions } from "../../hooks/StudentProfile/useCoordinatorActions";
import { AddChestToUserForm } from "./AddChestToUserForm";
import { useChangeGroup } from "../../hooks/common/useChangeGroup";
import { useOverrideGrade } from "../../hooks/common/useOverrideGrade";
import { ScreenContentContainer } from "../../components/layout/ScreenContentContainer";
import { CustomButton } from "../../components/CustomButton";
import { LoadingScreen } from "../Loading/LoadingScreen";
import { ErrorScreen } from "../Error/ErrorScreen";

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
    handleRegenerateGrade,
  } = useCoordinatorActions(studentId as string, userId);

  const { openChangeGroup } = useChangeGroup();
  const { openOverrideGrade } = useOverrideGrade();

  if (!studentId) return <p>Id studentanie jest zdefiniowany</p>;
  if (!userId) return <p>Id nauczyciela nie jest zdefiniowany</p>;

  if (loading || formDataLoading || chestsLoading) return <LoadingScreen />;
  if (error || formDataError || chestsError || !studentData || !currLevel)
    return <ErrorScreen />;

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

  const getTeacherActionButtons = () => {
    return (
      <div style={styles.buttonsContainer}>
        <CustomButton onClick={openAddDialog} disabled={disableEditMode}>
          Dodaj punkty
        </CustomButton>

        <CustomButton onClick={openChestDialog} disabled={disableEditMode}>
          Dodaj skrzynkę
        </CustomButton>
        <CustomButton
          onClick={() =>
            openOverrideGrade({
              studentId,
              editionId: selectedEdition?.editionId as string,
              grade: studentData.grade,
            })
          }
          disabled={disableEditMode || !selectedEdition?.editionId}
        >
          Nadpisz ocenę
        </CustomButton>
        <CustomButton
          onClick={() => handleRegenerateGrade(studentId)}
          disabled={disableEditMode || !selectedEdition?.editionId}
        >
          Wygeneruj ocenę
        </CustomButton>
        <CustomButton
          onClick={() =>
            openChangeGroup({
              studentId,
              groupId: studentData.group?.id as string,
              editionId: selectedEdition?.editionId as string,
            })
          }
          disabled={
            disableEditMode ||
            !studentData.group?.id ||
            !selectedEdition?.editionId
          }
        >
          Zmień grupę
        </CustomButton>
      </div>
    );
  };

  return (
    <ScreenContentContainer
      sidebar={
        <SideBar
          student={studentData}
          categoriesBarProps={categories}
          sumOfAllPoints={sumOfAllPoints}
          currLevel={currLevel}
          prevLevel={prevLevel}
          nextLevel={nextLevel}
          bonuses={bonuses}
        />
      }
    >
      {/* no rights info */}
      {disableEditMode && (
        <NotEditableInfo
          hasEditableRights={hasEditableRights}
          isSelectedEditionActive={isSelectedEditionActive}
        />
      )}

      {/* teacher action buttons */}
      {getTeacherActionButtons()}

      {/* table */}
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
            categoryId: addChestCategories[0]?.id,
            subcategoryId: addChestCategories[0]?.subcategories[0]?.id,
            chestId: chests[0]?.chestId,
          }}
          formError={chestError}
        />
      </Dialog>
    </ScreenContentContainer>
  );
}

const styles: Styles = {
  buttonsContainer: {
    display: "flex",
    gap: 12,
  },
};
