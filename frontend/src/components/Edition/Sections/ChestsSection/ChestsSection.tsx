import { Dialog } from "@mui/material";
import { Styles } from "../../../../utils/Styles";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { useChestsSection } from "../../../../hooks/Edition/useChestsSection";

import { useParams } from "react-router-dom";
import { ChestsList } from "./ChestsList/ChestsList";
import { AddChestForm } from "./AddChestForm/AddChestForm";

export const ChestsSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const {
    awards,
    chests,
    selectedChests,
    selectedAwards,

    imageIds,
    loading,
    error,

    handleSelectChest,
    formError,

    isAddChest,
    closeAddChest,
    openAddChest,
    handleAddChest,

    isEditChest,
    openEditChest,
    closeEditChest,
    handleEditChest,

    selectedChest,

    handleDeleteChest,
    handleCopyChest,
  } = useChestsSection(editionId);

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.container}>
      <button onClick={openAddChest}>Dodaj skrzynkę</button>

      <ChestsList
        chests={selectedChests}
        selectedChests={selectedChests}
        handleSelectChest={handleSelectChest}
        title={"Wybrane skrzynki"}
        handleEditChest={openEditChest}
        handleDeleteChest={handleDeleteChest}
        handleCopyChest={handleCopyChest}
      />
      <ChestsList
        chests={chests}
        selectedChests={selectedChests}
        handleSelectChest={handleSelectChest}
        title={"Wszystkie skrzynki"}
        handleEditChest={openEditChest}
        handleDeleteChest={handleDeleteChest}
        handleCopyChest={handleCopyChest}
      />

      <Dialog open={isAddChest}>
        <CloseHeader onCloseClick={closeAddChest} />
        <AddChestForm
          formError={formError}
          handleConfirm={handleAddChest}
          title="Dodaj skrzynkę"
          imageIds={imageIds}
          awardsThisEdition={selectedAwards}
          awardsNotThisEdition={awards.filter(
            (a) =>
              !selectedAwards.some(
                (aw) => aw.award.awardId === a.award.awardId,
              ),
          )}
        />
      </Dialog>

      <Dialog open={isEditChest}>
        <CloseHeader onCloseClick={closeEditChest} />
        <AddChestForm
          formError={formError}
          handleConfirm={handleEditChest}
          imageIds={imageIds}
          awardsThisEdition={selectedAwards}
          awardsNotThisEdition={awards.filter(
            (a) =>
              !selectedAwards.some(
                (aw) => aw.award.awardId === a.award.awardId,
              ),
          )}
          initialValues={
            selectedChest
              ? {
                  awardBundleCount: selectedChest.chest.awardBundleCount,
                  fileId: selectedChest.chest.imageFile?.fileId as string,
                  name: selectedChest.chest.chestType,
                  awardThisEditionIds: selectedChest.chest.chestAward
                    .filter((a) =>
                      selectedAwards.some(
                        (aw) => aw.award.awardId === a.award.awardId,
                      ),
                    )
                    .map((award) => award.award.awardId),
                  awardNotThisEditionIds: selectedChest.chest.chestAward
                    .filter(
                      (a) =>
                        !selectedAwards.some(
                          (aw) => aw.award.awardId === a.award.awardId,
                        ),
                    )
                    .map((award) => award.award.awardId),
                }
              : undefined
          }
          title="Edytuj skrzynkę"
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
