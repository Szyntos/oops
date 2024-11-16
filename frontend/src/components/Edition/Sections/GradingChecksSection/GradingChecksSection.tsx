import { Dialog } from "@mui/material";
import { useGradingChecksSection } from "../../../../hooks/Edition/useGradingChecksSection";
import { Styles } from "../../../../utils/Styles";

import { useParams } from "react-router-dom";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { ChecksForm } from "./ChecksForm";
import { EMPTY_FIELD_STRING } from "../../../../utils/constants";
import { Category } from "../../../../hooks/Edition/categories/useCategoriesSection";

export const GradingChecksSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const {
    gradingChecks,
    formCategories,
    formLevelSet,
    loading,
    error,

    formError,

    isAddOpened,
    closeAdd,
    openAdd,
    handleAdd,

    isEditOpened,
    openEdit,
    closeEdit,
    handleEdit,
  } = useGradingChecksSection(editionId);

  console.log(gradingChecks);
  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  const level = formLevelSet.levelSet.levels.find(
    (l) => l.levelId === gradingChecks?.endOfLabsLevelsThreshold,
  );

  const category: Category | undefined = formCategories.find(
    (c) => c.category.categoryId === gradingChecks?.projectId,
  );

  return (
    <div style={styles.container}>
      <div>grading checks: {editionId}</div>

      <button onClick={gradingChecks ? openEdit : openAdd}>
        {gradingChecks ? "edit checks" : "add checks"}
      </button>

      <div>
        <div>
          endOfLabsDate: {gradingChecks?.endOfLabsDate ?? EMPTY_FIELD_STRING}
        </div>
        <div>
          endOfLabsLevelsThreshold: {level?.levelName ?? EMPTY_FIELD_STRING}
        </div>
        <div>
          projectId: {category?.category.categoryName ?? EMPTY_FIELD_STRING}
        </div>
        <div>
          projectPointsThreshold:{" "}
          {gradingChecks?.projectPointsThreshold ?? EMPTY_FIELD_STRING}
        </div>
      </div>

      <Dialog open={isAddOpened}>
        <CloseHeader onCloseClick={closeAdd} />
        <ChecksForm
          formError={formError}
          handleConfirm={handleAdd}
          categories={formCategories}
          title="Add Grading Checks"
          levelSet={formLevelSet}
        />
      </Dialog>

      <Dialog open={isEditOpened}>
        <CloseHeader onCloseClick={closeEdit} />
        <ChecksForm
          formError={formError}
          handleConfirm={handleEdit}
          categories={formCategories}
          levelSet={formLevelSet}
          initialValues={
            gradingChecks
              ? {
                  endOfLabsDate: gradingChecks.endOfLabsDate,
                  endOfLabsLevelsThreshold:
                    gradingChecks.endOfLabsLevelsThreshold,
                  projectPointsThreshold: parseInt(
                    gradingChecks.projectPointsThreshold as unknown as string,
                  ),
                  projectId: gradingChecks.projectId,
                }
              : undefined
          }
          title="Edit Grading Checks"
        />
      </Dialog>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};
