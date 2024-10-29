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
        handleSelectAward={handleSelectAward}
        title={"Selected awards"}
        handleEditAward={openEditAward}
      />
      <AwardsList
        awards={awards}
        selectedAwards={selectedAwards}
        handleSelectAward={handleSelectAward}
        title={"All awards"}
        handleEditAward={openEditAward}
      />

      <Dialog open={isAddAward}>
        <CloseHeader onCloseClick={closeAddAward} />
        <AddAwardForm
          formError={formError}
          handleConfirm={handleAddAward}
          categories={formCategories}
          title="Add Award"
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
                  ...selectedAward,
                  awardValue: parseInt(selectedAward.awardValue),
                  imageId: parseInt(selectedAward.imageFileId ?? "-1"),
                }
              : undefined
          }
          title="Edit Award"
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
