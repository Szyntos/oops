import { Styles } from "../../utils/Styles";
import { AddEditionForm } from "../../components/Editions/AddEditionForm";
import { EditionsList } from "../../components/Editions/EditionsList/EditionsList";
import { useEditionsScreen } from "../../hooks/Editions/useEditionsScreen";
import { LoadingScreen } from "../Loading/LoadingScreen";
import { ErrorScreen } from "../Error/ErrorScreen";
import { CustomDialog } from "../../components/dialogs/CustomDialog";
import { CustomButton } from "../../components/CustomButton";

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
    <div style={styles.container}>
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

      <CustomButton onClick={openAddDialog}>Utwórz edycję</CustomButton>

      <EditionsList
        editions={editions}
        handleDeleteClick={handleDeleteClick}
        handleCopyClick={openCopyDialog}
        handleEditClick={openEditDialog}
      />
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    gap: 12,
    flexDirection: "column",
    margin: 12,
  },
};
