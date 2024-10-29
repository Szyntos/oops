import { Dialog } from "@mui/material";
import { Styles } from "../../../../utils/Styles";
import { AwardsList } from "./AwardsList/AwardsList";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { useAwardsSection } from "../../../../hooks/Edition/useAwardsSection";
import { AddAwardForm } from "./AddAwardForm/AddAwardForm";

import { useParams } from "react-router-dom";

export const AwardsSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const {
    awards,
    selectedAwards,
    formCategories,
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
  } = useAwardsSection(editionId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.container}>
      <button onClick={openAddAward}>add award</button>

      <AwardsList
        awards={selectedAwards}
        selectedAwards={selectedAwards}
        handleSelectAwardClick={handleSelectAward}
        title={"Selected awards"}
        handleEditAwardClick={openEditAward}
      />
      <AwardsList
        awards={awards}
        selectedAwards={selectedAwards}
        handleSelectAwardClick={handleSelectAward}
        title={"All awards"}
        handleEditAwardClick={openEditAward}
      />

      <Dialog open={isAddAward}>
        <CloseHeader onCloseClick={closeAddAward} />
        <AddAwardForm
          formError={formError}
          handleConfirm={handleAddAward}
          categories={formCategories}
        />
      </Dialog>

      <Dialog open={isEditAward}>
        <CloseHeader onCloseClick={closeEditAward} />
        <AddAwardForm
          formError={formError}
          handleConfirm={handleEditAward}
          categories={formCategories}
          initialValues={
            selectedAward
              ? {
                  awardName: selectedAward.awardName,
                  awardType: selectedAward.awardType,
                  awardValue: parseInt(selectedAward.awardValue),
                  categoryId: selectedAward.categoryId,
                  description: selectedAward.description,
                  maxUsages: selectedAward.maxUsages,
                  imageId: parseInt(selectedAward.imageFileId ?? "-1"),
                }
              : undefined
          }
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
