import { Styles } from "../../utils/Styles";
import { Dialog } from "@mui/material";
import { CloseHeader } from "../../components/dialogs/CloseHeader";
import { AddEditionForm } from "../../components/Editions/AddEditionForm";
import { EditionsList } from "../../components/Editions/EditionsList/EditionsList";
import { useEditionsScreen } from "../../hooks/Editions/useEditionsScreen";
import { LoadingScreen } from "../Loading/LoadingScreen";
import { ErrorScreen } from "../Error/ErrorScreen";

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
      <Dialog open={isAddOpen}>
        <CloseHeader onCloseClick={closeAddDialog} />
        <AddEditionForm
          createError={formError}
          handleAddEdition={handleCreateClick}
          title={"Dodaj edycję"}
        />
      </Dialog>

      <Dialog open={isCopyOpen}>
        <CloseHeader onCloseClick={closeCopyDialog} />
        <AddEditionForm
          createError={formError}
          handleAddEdition={handleCopyClick}
          title={"Kopiuj edycję"}
          initialValues={
            selectedEdition
              ? {
                  name: selectedEdition.edition.editionName,
                  year: selectedEdition.edition.editionYear,
                }
              : undefined
          }
        />
      </Dialog>

      <Dialog open={isEditOpen}>
        <CloseHeader onCloseClick={closeEditDialog} />
        <AddEditionForm
          createError={formError}
          handleAddEdition={handleEditClick}
          title={"Edytuj edycję"}
          initialValues={
            selectedEdition
              ? {
                  name: selectedEdition.edition.editionName,
                  year: selectedEdition.edition.editionYear,
                }
              : undefined
          }
        />
      </Dialog>

      <button onClick={openAddDialog}>utwórz edycję</button>

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
