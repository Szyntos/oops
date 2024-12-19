import { AddEditionForm } from "../../components/Editions/AddEditionForm";
import { useEditionsScreen } from "../../hooks/Editions/useEditionsScreen";
import { LoadingScreen } from "../Loading/LoadingScreen";
import { ErrorScreen } from "../Error/ErrorScreen";
import { coordinatorStyles } from "../../utils/utils";
import { CustomButton } from "../../components/CustomButton";
import { CardsSection } from "../../components/Edition/CardsSection";
import { EditionCard } from "../../components/Editions/EditionsList/EditionCard";
import { CustomDialog } from "../../components/dialogs/CustomDialog";

export const EditionsScreen = () => {
  const {
    loading,
    error,
    editions,
    formError,
    selectedEdition,
    // ADD
    isAddOpen,
    openAddDialog,
    closeAddDialog,
    handleCreateClick,
    // COPY
    isCopyOpen,
    openCopyDialog,
    closeCopyDialog,
    handleCopyClick,
    // EDIT
    isEditOpen,
    openEditDialog,
    closeEditDialog,
    handleEditClick,
    // DELETE
    handleDeleteClick,
  } = useEditionsScreen();

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;

  return (
    <div style={{ ...coordinatorStyles.container, margin: 20 }}>
      <div style={coordinatorStyles.buttonsContainer}>
        <CustomButton onClick={openAddDialog}>Utwórz edycję</CustomButton>
      </div>

      <CardsSection
        title={"Edycje"}
        cards={
          editions.map((edition) => (
            <EditionCard
              data={edition}
              handleDeleteClick={() => handleDeleteClick(edition)}
              handleCopyClick={() => openCopyDialog(edition)}
              handleEditClick={() => openEditDialog(edition)}
            />
          )) ?? []
        }
      ></CardsSection>

      <CustomDialog
        isOpen={isAddOpen}
        onCloseClick={closeAddDialog}
        title="Dodaj edycję"
      >
        <AddEditionForm
          createError={formError}
          handleAddEdition={handleCreateClick}
        />
      </CustomDialog>

      <CustomDialog
        isOpen={isEditOpen}
        onCloseClick={closeEditDialog}
        title="Edytuj edycję"
      >
        <AddEditionForm
          createError={formError}
          handleAddEdition={handleEditClick}
          initialValues={
            selectedEdition
              ? {
                  name: selectedEdition.edition.editionName,
                  year: selectedEdition.edition.editionYear,
                }
              : undefined
          }
        />
      </CustomDialog>

      <CustomDialog
        isOpen={isCopyOpen}
        onCloseClick={closeCopyDialog}
        title="Kopiuj edycję"
      >
        <AddEditionForm
          createError={formError}
          handleAddEdition={handleCopyClick}
          initialValues={
            selectedEdition
              ? {
                  name: selectedEdition.edition.editionName,
                  year: selectedEdition.edition.editionYear,
                }
              : undefined
          }
        />
      </CustomDialog>
    </div>
  );
};
