import { Dialog } from "@mui/material";
import { useGradingChecksSection } from "../../../../hooks/Edition/useGradingChecksSection";
import { Styles } from "../../../../utils/Styles";

import { useParams } from "react-router-dom";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { ChecksForm } from "./ChecksForm";
import { EMPTY_FIELD_STRING } from "../../../../utils/constants";
import { Category } from "../../../../hooks/Edition/categories/useCategoriesSection";
import { SetupButtons } from "../SetupButtons";
import { LoadingScreen } from "../../../../screens/Loading/LoadingScreen";
import { ErrorScreen } from "../../../../screens/Error/ErrorScreen";

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

  if (loading) return <LoadingScreen type="edition" />;
  if (error || !gradingChecks) return <ErrorScreen type="edition" />;

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
      <div>Warunki zaliczenia: {editionId}</div>

      <SetupButtons
        permissions={gradingChecks.permissions}
        isSelected={false}
        handleDelete={handleDelete}
        handleEdit={openEdit}
        handleAdd={openAdd}
      />

      <div>
        <div>
          Data końca laboratorium:{" "}
          {gradingChecks.gradingCheck?.endOfLabsDate ?? EMPTY_FIELD_STRING}
        </div>
        <div>
          Poziom do zdobycia przed końcem laboratorium:{" "}
          {level?.levelName ?? EMPTY_FIELD_STRING}
        </div>
        <div>
          Wybrana kategoria:{" "}
          {category?.category.categoryName ?? EMPTY_FIELD_STRING}
        </div>
        <div>
          Liczba punktów do zdobycia za daną kategorię:{" "}
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
          title="Dodaj"
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
          title="Edytuj"
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
