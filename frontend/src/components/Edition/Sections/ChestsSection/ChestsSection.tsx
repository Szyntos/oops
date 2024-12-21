import { useChestsSection } from "../../../../hooks/Edition/useChestsSection";

import { useParams } from "react-router-dom";
import { ChestsList } from "./ChestsList/ChestsList";
import { AddChestForm } from "./AddChestForm/AddChestForm";
import { LoadingScreen } from "../../../../screens/Loading/LoadingScreen";
import { ErrorScreen } from "../../../../screens/Error/ErrorScreen";
import { CustomButton } from "../../../CustomButton";
import { coordinatorStyles } from "../../../../utils/utils";
import { CustomDialog } from "../../../dialogs/CustomDialog";

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

    handleActivateChest,
  } = useChestsSection(editionId);

  if (loading) return <LoadingScreen type="edition" />;
  if (error) return <ErrorScreen type="edition" />;

  return (
    <div style={coordinatorStyles.container}>
      <CustomButton onClick={openAddChest}>Dodaj skrzynkę</CustomButton>

      <ChestsList
        chests={selectedChests}
        selectedChests={selectedChests}
        handleSelectChest={handleSelectChest}
        title={"Wybrane skrzynki"}
        handleEditChest={openEditChest}
        handleDeleteChest={handleDeleteChest}
        handleCopyChest={handleCopyChest}
        handleActivateChest={handleActivateChest}
        editionId={editionId}
      />
      <ChestsList
        chests={chests}
        selectedChests={selectedChests}
        handleSelectChest={handleSelectChest}
        title={"Wszystkie skrzynki"}
        handleEditChest={openEditChest}
        handleDeleteChest={handleDeleteChest}
        handleCopyChest={handleCopyChest}
        handleActivateChest={handleActivateChest}
        editionId={editionId}
      />

      <CustomDialog
        isOpen={isAddChest}
        title="Dodaj skrzynkę"
        onCloseClick={closeAddChest}
      >
        <AddChestForm
          formError={formError}
          handleConfirm={handleAddChest}
          imageIds={imageIds}
          awardsThisEdition={selectedAwards}
          awardsNotThisEdition={awards.filter(
            (a) =>
              !selectedAwards.some(
                (aw) => aw.award.awardId === a.award.awardId,
              ),
          )}
        />
      </CustomDialog>

      <CustomDialog
        isOpen={isEditChest}
        title="Edytuj skrzynkę"
        onCloseClick={closeEditChest}
      >
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
        />
      </CustomDialog>
    </div>
  );
};
