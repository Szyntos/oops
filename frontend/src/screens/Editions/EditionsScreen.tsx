import { EditionsQuery } from "../../graphql/editions.graphql.types";
import { Styles } from "../../utils/Styles";
import { Dialog } from "@mui/material";
import { CloseHeader } from "../../components/dialogs/CloseHeader";
import { AddEditionForm } from "../../components/Editions/AddEditionForm";
import { EditionsList } from "../../components/Editions/EditionsList/EditionsList";
import { useEditionsScreen } from "../../hooks/Editions/useEditionsScreen";

export type Edition = EditionsQuery["edition"][number];

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

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error?.message}</div>;

  return (
    <div style={styles.container}>
      <Dialog open={isAddOpen}>
        <CloseHeader onCloseClick={closeAddDialog} />
        <AddEditionForm
          createError={formError}
          handleAddEdition={handleCreateClick}
          title={"Add Edition"}
        />
      </Dialog>

      <Dialog open={isCopyOpen}>
        <CloseHeader onCloseClick={closeCopyDialog} />
        <AddEditionForm
          createError={formError}
          handleAddEdition={handleCopyClick}
          title={"Copy Edition"}
          initialValues={
            selectedEdition
              ? {
                  name: selectedEdition.name,
                  year: selectedEdition.editionYear,
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
          title={"Edit Edition"}
          initialValues={
            selectedEdition
              ? {
                  name: selectedEdition.name,
                  year: selectedEdition.editionYear,
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
