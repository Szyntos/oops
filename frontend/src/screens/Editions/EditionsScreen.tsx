import { Dialog } from "@mui/material";
import { CloseHeader } from "../../components/dialogs/CloseHeader";
import { AddEditionForm } from "../../components/Editions/AddEditionForm";
import { useEditionsScreen } from "../../hooks/Editions/useEditionsScreen";
import { LoadingScreen } from "../Loading/LoadingScreen";
import { ErrorScreen } from "../Error/ErrorScreen";
import { coordinatorStyles } from "../../utils/utils";
import { CustomButton } from "../../components/CustomButton";
import { CardsSection } from "../../components/Edition/CardsSection";
import { EditionCard } from "../../components/Editions/EditionsList/EditionCard";

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
    </div>
  );
};
