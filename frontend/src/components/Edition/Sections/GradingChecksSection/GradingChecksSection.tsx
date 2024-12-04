import { Dialog } from "@mui/material";
import { useGradingChecksSection } from "../../../../hooks/Edition/useGradingChecksSection";
import { Styles } from "../../../../utils/Styles";

import { useParams } from "react-router-dom";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { ChecksForm } from "./ChecksForm";
import { EMPTY_FIELD_STRING } from "../../../../utils/constants";
import { Category } from "../../../../hooks/Edition/categories/useCategoriesSection";
import { SetupButtons } from "../SetupButtons";

export const GradingChecksSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const {
    gradingChecks,
    formCategories,
    formLevels,
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

    handleDelete,
  } = useGradingChecksSection(editionId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;
  if (!gradingChecks) return <div>something went wrong...</div>;

  const level = formLevels.find(
    (l) =>
      l.levelId ===
      gradingChecks.gradingCheck?.endOfLabsLevelsThreshold.levelId,
  );

  const category: Category | undefined = formCategories.find(
    (c) =>
      c.category.categoryId === gradingChecks.gradingCheck?.project.categoryId,
  );

  return (
    <div style={styles.container}>
      <div>grading checks: {editionId}</div>

      <SetupButtons
        permissions={gradingChecks.permissions}
        isSelected={false}
        handleDelete={handleDelete}
        handleEdit={openEdit}
        handleAdd={openAdd}
      />

      <div>
        <div>
          dataKońcaLabów:{" "}
          {gradingChecks.gradingCheck?.endOfLabsDate ?? EMPTY_FIELD_STRING}
        </div>
        <div>
          prógPunktowyPoziomów: {level?.levelName ?? EMPTY_FIELD_STRING}
        </div>
        <div>
          projectId: {category?.category.categoryName ?? EMPTY_FIELD_STRING}
        </div>
        <div>
          prógPunktowyProjektu:{" "}
          {gradingChecks.gradingCheck?.projectPointsThreshold ??
            EMPTY_FIELD_STRING}
        </div>
      </div>

      <Dialog open={isAddOpened}>
        <CloseHeader onCloseClick={closeAdd} />
        <ChecksForm
          formError={formError}
          handleConfirm={handleAdd}
          categories={formCategories}
          title="Dodaj zasady oceniania"
          levels={formLevels}
        />
      </Dialog>

      <Dialog open={isEditOpened}>
        <CloseHeader onCloseClick={closeEdit} />
        <ChecksForm
          formError={formError}
          handleConfirm={handleEdit}
          categories={formCategories}
          levels={formLevels}
          initialValues={
            gradingChecks.gradingCheck
              ? {
                  endOfLabsDate: gradingChecks.gradingCheck.endOfLabsDate,
                  endOfLabsLevelsThreshold:
                    gradingChecks.gradingCheck.endOfLabsLevelsThreshold.levelId,
                  projectPointsThreshold:
                    gradingChecks.gradingCheck.projectPointsThreshold,
                  projectId: gradingChecks.gradingCheck.project.categoryId,
                }
              : undefined
          }
          title="Edytuj zasady oceniania"
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
