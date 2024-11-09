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
    chests,
    selectedChests,
    awards,

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
          awards={awards}
        />
      </Dialog>

      <Dialog open={isEditChest}>
        <CloseHeader onCloseClick={closeEditChest} />
        <AddChestForm
          formError={formError}
          handleConfirm={handleEditChest}
          imageIds={imageIds}
          awards={awards}
          initialValues={
            selectedChest
              ? {
                  awardBundleCount: selectedChest.awardBundleCount,
                  fileId: parseInt(selectedChest.imageFileId ?? "-1"),
                  name: selectedChest.type,
                  awardIds: selectedChest.chestAwards.map(
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
