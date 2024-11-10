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

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.container}>
      <button onClick={openAddChest}>add chest</button>

      <ChestsList
        chests={selectedChests}
        selectedChests={selectedChests}
        handleSelectChest={handleSelectChest}
        title={"Selected chests"}
        handleEditChest={openEditChest}
        handleDeleteChest={handleDeleteChest}
        handleCopyChest={handleCopyChest}
      />
      <ChestsList
        chests={chests}
        selectedChests={selectedChests}
        handleSelectChest={handleSelectChest}
        title={"All chests"}
        handleEditChest={openEditChest}
        handleDeleteChest={handleDeleteChest}
        handleCopyChest={handleCopyChest}
      />

      <Dialog open={isAddChest}>
        <CloseHeader onCloseClick={closeAddChest} />
        <AddChestForm
          formError={formError}
          handleConfirm={handleAddChest}
          title="Add Chest"
          imageIds={imageIds}
          awardsInThisEdition={selectedAwards}
          awardsNotInThisEdition={awards.filter(
            (a) => !selectedAwards.some((aw) => aw.awardId === a.awardId),
          )}
        />
      </Dialog>

      <Dialog open={isEditChest}>
        <CloseHeader onCloseClick={closeEditChest} />
        <AddChestForm
          formError={formError}
          handleConfirm={handleEditChest}
          imageIds={imageIds}
          awardsInThisEdition={selectedAwards}
          awardsNotInThisEdition={awards.filter(
            (a) => !selectedAwards.some((aw) => aw.awardId === a.awardId),
          )}
          initialValues={
            selectedChest
              ? {
                  awardBundleCount: selectedChest.awardBundleCount,
                  fileId: selectedChest.imageFileId as string,
                  name: selectedChest.type,
                  awardIds: selectedChest.chestAwards.map(
                    (award) => award.award.awardId,
                  ),
                  awardsNotFormThisEdition: selectedChest.chestAwards.map(
                    (award) => award.award.awardId,
                  ),
                }
              : undefined
          }
          title="Edit Chest"
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
