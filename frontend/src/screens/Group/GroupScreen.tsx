import { useParams } from "react-router-dom";
import { Styles } from "../../utils/Styles";
import { useGroupScreenData } from "../../hooks/Group/useGroupScreenData";
import { GroupTableWithFilters } from "../../components/Group/table/GroupTableWithFilters";
import { Dialog } from "@mui/material";
import { CloseHeader } from "../../components/dialogs/CloseHeader";
import { PointsForm } from "../../components/StudentProfile/PointsForm/PointsForm";
import { useUser } from "../../hooks/common/useUser";
import { GroupPointsForm } from "../../components/Group/GroupPointsForm";
import { NotEditableInfo } from "../../components/StudentProfile/NotEditableInfo";
import { UsersRolesType } from "../../__generated__/schema.graphql.types";
import { useEditionSelection } from "../../hooks/common/useEditionSelection";
import { isEditionActive } from "../../utils/utils";

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

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;
  if (!teacherId) return <div>ERROR: something went worng</div>;

  const hasEditableRights =
    teacherId === userId || user.role === UsersRolesType.Coordinator;

  const isSelectedEditionActive = Boolean(
    selectedEdition && isEditionActive(selectedEdition),
  );

  const disableEditMode = !(isSelectedEditionActive && hasEditableRights);

  return (
    <div style={styles.screenContainer}>
      {disableEditMode && (
        <NotEditableInfo
          hasEditableRights={hasEditableRights}
          isSelectedEditionActive={isSelectedEditionActive}
        />
      )}

      <GroupTableWithFilters
        rows={rows}
        categories={categories}
        handleStudentClick={hasEditableRights ? openStudent : () => {}}
        handleSubcategoryClick={hasEditableRights ? openSubcategory : () => {}}
        editable={!disableEditMode}
      />

      <Dialog open={isStudentOpen}>
        <CloseHeader onCloseClick={closeStudent} />
        <PointsForm
          categories={addPointsCategories}
          handleConfirmClick={handleAddPointsConfirmation}
          mutationError={formError}
          initialValues={{ categoryId: "", subcategoryId: "", points: 0 }}
          variant="add"
          disableCategoryAndSubcategory={false}
        />
      </Dialog>

      <Dialog open={isSubcategoryOpen}>
        <CloseHeader onCloseClick={closeSubcategory} />
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
      </Dialog>
    </div>
  );
};

const styles: Styles = {
  screenContainer: {
    margin: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};
