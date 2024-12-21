import { useParams } from "react-router-dom";
import { useGroupScreenData } from "../../hooks/Group/useGroupScreenData";
import { GroupTableWithFilters } from "../../components/Group/table/GroupTableWithFilters";
import { PointsForm } from "../../components/StudentProfile/PointsForm/PointsForm";
import { useUser } from "../../hooks/common/useUser";
import { GroupPointsForm } from "../../components/Group/GroupPointsForm";
import { UsersRolesType } from "../../__generated__/schema.graphql.types";
import { useEditionSelection } from "../../hooks/common/useEditionSelection";
import { isEditionActive } from "../../utils/utils";
import { LoadingScreen } from "../Loading/LoadingScreen";
import { ErrorScreen } from "../Error/ErrorScreen";
import { CustomDialog } from "../../components/dialogs/CustomDialog";
import { CONTENT_CONTAINER_HEIGHT_CALC } from "../../components/layout/ScreenContentContainer";
import { Styles } from "../../utils/Styles";

export const GroupScreen = () => {
  const params = useParams();
  const groupId = params.groupId ? parseInt(params.groupId) : undefined;
  const teacherId = params.teacherId ?? undefined;
  const { selectedEdition } = useEditionSelection();

  const { user } = useUser();
  const userId = user.userId;

  const {
    rows,
    categories,
    loading,
    error,
    formError,
    isStudentOpen,
    openStudent,
    closeStudent,
    handleAddPointsConfirmation,
    addPointsCategories,
    isSubcategoryOpen,
    openSubcategory,
    closeSubcategory,
    handleAddPointsToGroup,
    selectedSubcategory,
  } = useGroupScreenData(groupId, userId);

  if (loading) return <LoadingScreen />;
  if (error || !teacherId) return <ErrorScreen />;

  const hasEditableRights =
    teacherId === userId || user.role === UsersRolesType.Coordinator;

  const isSelectedEditionActive = Boolean(
    selectedEdition &&
      isEditionActive(selectedEdition.startDate, selectedEdition.endDate),
  );

  const disableEditMode = !(isSelectedEditionActive && hasEditableRights);

  return (
    <div style={styles.screenContainer}>
      <GroupTableWithFilters
        rows={rows}
        categories={categories}
        handleStudentClick={hasEditableRights ? openStudent : () => {}}
        handleSubcategoryClick={hasEditableRights ? openSubcategory : () => {}}
        editable={!disableEditMode}
        disableEditMode={disableEditMode}
        hasEditableRights={hasEditableRights}
        isSelectedEditionActive={isSelectedEditionActive}
      />

      <CustomDialog
        isOpen={isStudentOpen}
        onCloseClick={closeStudent}
        title="Dodaj punkty"
      >
        <PointsForm
          categories={addPointsCategories}
          handleConfirmClick={handleAddPointsConfirmation}
          mutationError={formError}
          initialValues={{ categoryId: "", subcategoryId: "", points: 0 }}
          disableCategoryAndSubcategory={false}
        />
      </CustomDialog>

      <CustomDialog
        isOpen={isSubcategoryOpen}
        onCloseClick={closeSubcategory}
        title={`Dodaj punkty do ${selectedSubcategory?.subcategory.name}`}
        subtitle={`Max pkt: ${selectedSubcategory?.subcategory.maxPoints.toFixed(2)}`}
      >
        <GroupPointsForm
          initialRows={selectedSubcategory?.rows ?? []}
          handleAdd={handleAddPointsToGroup}
          formError={formError}
          // clearing selected subcategory on submit take some time
          // default values are necessary to avoid error
          subcategory={
            selectedSubcategory?.subcategory ?? {
              categoryId: -1,
              id: "",
              name: "",
              maxPoints: -1,
            }
          }
        />
      </CustomDialog>
    </div>
  );
};

// do not delete
const styles: Styles = {
  screenContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    height: CONTENT_CONTAINER_HEIGHT_CALC,
  },
};
