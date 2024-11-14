import { Dialog } from "@mui/material";
import { useGradingChecksSection } from "../../../../hooks/Edition/useGradingChecksSection";
import { Styles } from "../../../../utils/Styles";

import { useParams } from "react-router-dom";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { ChecksForm } from "./ChecksForm";
import { EMPTY_FIELD_STRING } from "../../../../utils/constants";

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

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

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
          endOfLabsLevelsThreshold:{" "}
          {gradingChecks?.endOfLabsLevelsThreshold ?? EMPTY_FIELD_STRING}
        </div>
        <div>projectId: {gradingChecks?.projectId ?? EMPTY_FIELD_STRING}</div>
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
                  projectPointsThreshold:
                    gradingChecks.projectPointsThreshold.toString(),
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
