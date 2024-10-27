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
    handleSelectClick,
    handleCreate,
    createAwardError,
    isOpen,
    closeDialog,
    openDialog,
  } = useAwardsSection(editionId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.container}>
      <button onClick={openDialog}>add award</button>

      <AwardsList
        awards={selectedAwards}
        selectedAwards={selectedAwards}
        handleSelectAwardClick={handleSelectClick}
        title={"Selected awards"}
      />
      <AwardsList
        awards={awards}
        selectedAwards={selectedAwards}
        handleSelectAwardClick={handleSelectClick}
        title={"All awards"}
      />

      <Dialog open={isOpen}>
        <CloseHeader onCloseClick={closeDialog} />
        <AddAwardForm
          createError={createAwardError}
          handleAddAward={handleCreate}
          categories={formCategories}
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
