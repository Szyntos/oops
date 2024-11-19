import { useNavigate, useParams } from "react-router-dom";
import { Styles } from "../../utils/Styles";
import { pathsGenerator } from "../../router/paths";
import { useGroupScreenData } from "../../hooks/Group/useGroupScreenData";
import { GroupTableWithFilters } from "../../components/Group/table/GroupTableWithFilters";
import { Dialog } from "@mui/material";
import { CloseHeader } from "../../components/dialogs/CloseHeader";
import { PointsForm } from "../../components/StudentProfile/PointsForm/PointsForm";
import { useUser } from "../../hooks/common/useUser";
import { GroupPointsForm } from "../../components/Group/GroupPointsForm";

export const Group = () => {
  const navigate = useNavigate();
  const params = useParams();
  const groupId = params.id ? parseInt(params.id) : undefined;

  // TODO add rights
  const { user } = useUser();
  const teacherId = user.userId;

  const {
    rows,
    categories,
    loading,
    error,
    formError,
    isStudentOpen,
    openStudent,
    formCategories,
    closeStudent,
    handleAddPointsConfirmation,

    isSubcategoryOpen,
    openSubcategory,
    closeSubcategory,
    handleAddPointsToGroup,
    selectedSubcategory,
  } = useGroupScreenData(groupId, teacherId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.screenContainer}>
      <div style={styles.header}>
        <button onClick={() => navigate(pathsGenerator.teacher.Groups)}>
          go back to groups list
        </button>
        <div>params - group id: {groupId}</div>
      </div>

      <GroupTableWithFilters
        rows={rows}
        categories={categories}
        handleStudentClick={openStudent}
        handleSubcategoryClick={openSubcategory}
      />

      <Dialog open={isStudentOpen}>
        <CloseHeader onCloseClick={closeStudent} />
        <PointsForm
          categories={formCategories}
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
          rows={selectedSubcategory?.rows ?? []}
          handleAdd={handleAddPointsToGroup}
          formError={formError}
          maxPoints={selectedSubcategory?.subcategory.maxPoints as number}
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
  header: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
