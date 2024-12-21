import { useGradingChecksSection } from "../../../../hooks/Edition/useGradingChecksSection";

import { useParams } from "react-router-dom";
import { ChecksForm } from "./ChecksForm";
import { EMPTY_FIELD_STRING } from "../../../../utils/constants";
import { Category } from "../../../../hooks/Edition/categories/useCategoriesSection";
import { SetupButtons } from "../SetupButtons";
import { LoadingScreen } from "../../../../screens/Loading/LoadingScreen";
import { ErrorScreen } from "../../../../screens/Error/ErrorScreen";
import { CustomText } from "../../../CustomText";
import { coordinatorStyles, getCardStyles } from "../../../../utils/utils";
import { CardsSection } from "../../CardsSection";
import { Styles } from "../../../../utils/Styles";
import { tokens } from "../../../../tokens";
import { CustomDialog } from "../../../dialogs/CustomDialog";

export const GradingChecksSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const {
    gradingChecks,
    formCategories,
    formLevels,
    loading,
    error,

    quotes,

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

  const displayDate =
    gradingChecks.gradingCheck?.endOfLabsDate ?? EMPTY_FIELD_STRING;
  const displayCategory = category?.category.categoryName ?? EMPTY_FIELD_STRING;
  const displayPoints =
    gradingChecks.gradingCheck?.projectPointsThreshold.toFixed(2) ??
    EMPTY_FIELD_STRING;
  const displayLevel = level?.levelName ?? EMPTY_FIELD_STRING;

  return (
    <div style={coordinatorStyles.container}>
      <div style={coordinatorStyles.buttonsContainer}>
        <SetupButtons
          permissions={gradingChecks.permissions}
          isSelected={false}
          handleAdd={openAdd}
          isBigVariant={true}
        />
      </div>
      <CardsSection
        title={"Warunki zaliczenia"}
        cards={[
          <div style={{ ...getCardStyles(true), minWidth: 400 }}>
            <div style={coordinatorStyles.textContainer}>
              <CustomText style={coordinatorStyles.title}>
                Warunki zaliczenia
              </CustomText>

              <div style={styles.row}>
                <CustomText>Data końca laboratorium: </CustomText>

                <CustomText color={tokens.color.text.tertiary}>
                  {displayDate}
                </CustomText>
              </div>

              <div style={styles.row}>
                <CustomText>
                  Poziom do zdobycia przed końcem laboratorium:
                </CustomText>
                <CustomText color={tokens.color.text.tertiary}>
                  {displayLevel}
                </CustomText>
              </div>

              <div style={styles.row}>
                <CustomText>Wybrana kategoria: </CustomText>
                <CustomText color={tokens.color.text.tertiary}>
                  {displayCategory}
                </CustomText>
              </div>

              <div style={styles.row}>
                <CustomText>
                  Liczba punktów do zdobycia za daną kategorię:
                </CustomText>
                <CustomText color={tokens.color.text.tertiary}>
                  {displayPoints}pkt
                </CustomText>
              </div>
            </div>
            <SetupButtons
              permissions={gradingChecks.permissions}
              isSelected={false}
              handleDelete={handleDelete}
              handleEdit={openEdit}
            />
          </div>,
        ]}
      />

      <CardsSection
        title={"Podgląd"}
        cards={[
          <div style={{ ...getCardStyles(true), maxWidth: 420 }}>
            <div style={coordinatorStyles.textContainer}>
              <CustomText style={coordinatorStyles.title}>Podgląd</CustomText>

              <CustomText>
                "Aby zaliczyć przedmiot Twój zwierzak musi być na koniec co
                najmniej{" "}
                {quotes?.getQuoteVariables.firstPassingLevel?.levelName} oraz
                powinien zdobyć co najmniej {displayPoints}
                pkt w trakcie {displayCategory}. Ponadto musi on wykluć się z{" "}
                {displayLevel} przed końcem laboratoriów {displayDate}
                ."
              </CustomText>
              <CustomText color={tokens.color.text.tertiary}>
                ~ {quotes?.getQuoteVariables.coordinator.firstName}{" "}
                {quotes?.getQuoteVariables.coordinator.secondName}
              </CustomText>
            </div>
          </div>,
        ]}
      />

      <CustomDialog
        isOpen={isAddOpened}
        onCloseClick={closeAdd}
        title="Dodaj warunki"
      >
        <ChecksForm
          formError={formError}
          handleConfirm={handleAdd}
          categories={formCategories}
          levels={formLevels}
        />
      </CustomDialog>

      <CustomDialog
        isOpen={isEditOpened}
        onCloseClick={closeEdit}
        title="Edytuj warunki"
      >
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
        />
      </CustomDialog>
    </div>
  );
};

const styles: Styles = {
  row: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
};
