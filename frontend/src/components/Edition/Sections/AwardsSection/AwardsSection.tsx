import { AwardsList } from "./AwardsList/AwardsList";
import { useAwardsSection } from "../../../../hooks/Edition/useAwardsSection";
import { AddAwardForm } from "./AddAwardForm/AddAwardForm";

import { useParams } from "react-router-dom";
import { LoadingScreen } from "../../../../screens/Loading/LoadingScreen";
import { ErrorScreen } from "../../../../screens/Error/ErrorScreen";
import { CustomButton } from "../../../CustomButton";
import { coordinatorStyles } from "../../../../utils/utils";
import { CustomDialog } from "../../../dialogs/CustomDialog";

export const AwardsSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const {
    awards,
    selectedAwards,
    formCategories,
    imageIds,
    loading,
    error,

    handleSelectAward,
    formError,

    isAddAward,
    closeAddAward,
    openAddAward,
    handleAddAward,

    isEditAward,
    openEditAward,
    closeEditAward,
    handleEditAward,

    selectedAward,

    handleDeleteAward,
    handleCopyAward,
  } = useAwardsSection(editionId);

  if (loading) return <LoadingScreen type="edition" />;
  if (error) return <ErrorScreen type="edition" />;

  return (
    <div style={coordinatorStyles.container}>
      <CustomButton onClick={openAddAward}>Dodaj nagrodę</CustomButton>

      <AwardsList
        awards={selectedAwards}
        selectedAwards={selectedAwards}
        handleSelectAward={handleSelectAward}
        title={"Wybrane nagrody"}
        handleEditAward={openEditAward}
        handleDeleteAward={handleDeleteAward}
        handleCopyAward={handleCopyAward}
      />
      <AwardsList
        awards={awards}
        selectedAwards={selectedAwards}
        handleSelectAward={handleSelectAward}
        title={"Wszystkie nagrody"}
        handleEditAward={openEditAward}
        handleDeleteAward={handleDeleteAward}
        handleCopyAward={handleCopyAward}
      />

      <CustomDialog
        isOpen={isAddAward}
        title={"Dodaj nagrodę"}
        onCloseClick={closeAddAward}
      >
        <AddAwardForm
          formError={formError}
          handleConfirm={handleAddAward}
          categories={formCategories}
          imageIds={imageIds}
        />
      </CustomDialog>

      <CustomDialog
        isOpen={isEditAward}
        title={"Edytuj nagrodę"}
        onCloseClick={closeEditAward}
      >
        <AddAwardForm
          formError={formError}
          handleConfirm={handleEditAward}
          categories={formCategories}
          imageIds={imageIds}
          initialValues={
            selectedAward
              ? {
                  ...selectedAward.award,
                  awardType: selectedAward.award.awardType.toUpperCase(),
                  awardValue: parseFloat(selectedAward.award.awardValue),
                  imageId: selectedAward.award.imageFile?.fileId ?? "-1",
                  categoryId: selectedAward.award.category.categoryId,
                }
              : undefined
          }
        />
      </CustomDialog>
    </div>
  );
};
