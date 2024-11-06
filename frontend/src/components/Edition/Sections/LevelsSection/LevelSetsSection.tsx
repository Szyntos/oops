import { Dialog } from "@mui/material";
import { Styles } from "../../../../utils/Styles";
import { CloseHeader } from "../../../dialogs/CloseHeader";

import { useParams } from "react-router-dom";
import { useLevelSetsSection } from "../../../../hooks/Edition/useLevelSetsSection";
import { LevelSetsList } from "./LevelSetsList/LevelSetsList";
import { AddSetForm } from "./AddSetForm/AddSetForm";
import { EMPTY_FIELD_STRING } from "../../../../utils/constants";
import { SelectedSetCard } from "./LevelSetsList/SelectedSetCard";

export const LevelSetsSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const {
    levelSets,
    imageIds,
    activeSet,
    loading,
    error,

    handleSelectSet,
    formError,

    isAddSetOpen,
    closeAddSet,
    openAddSet,
    handleAddSet,

    isEditSetOpen,
    openEditSet,
    closeEditSet,
    handleEditSet,

    selectedToEditSet,

    handleDeleteSet,
  } = useLevelSetsSection(editionId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.container}>
      <button onClick={openAddSet}>add level set</button>

      <div>
        <div>Selected Set:</div>
        {activeSet ? (
          <SelectedSetCard
            levelSet={activeSet}
            onSelectClick={() => handleSelectSet(activeSet)}
            onEditClick={() => openEditSet(activeSet)}
            onDeleteClick={() => {
              handleDeleteSet(activeSet);
            }}
          />
        ) : (
          EMPTY_FIELD_STRING
        )}
      </div>

      <LevelSetsList
        levelSets={levelSets}
        selectedLevelSet={activeSet}
        handleSelect={handleSelectSet}
        handleEdit={openEditSet}
        handleDelete={handleDeleteSet}
        title={"All level sets"}
      />

      <Dialog open={isAddSetOpen} maxWidth={"lg"}>
        <CloseHeader onCloseClick={closeAddSet} />
        <AddSetForm
          formError={formError}
          initLevels={[]}
          handleConfirm={handleAddSet}
          imageIds={imageIds}
        />
      </Dialog>

      <Dialog open={isEditSetOpen} maxWidth={"lg"}>
        <CloseHeader onCloseClick={closeEditSet} />
        <AddSetForm
          initLevels={
            selectedToEditSet?.levels?.map((l, index) => ({
              ...l,
              ordinal: index,
              minPoints: parseFloat(l.minimumPoints),
              maxPoints: parseFloat(l.maximumPoints),
              imageId: l.imageFileId ?? "-1",
            })) ?? []
          }
          formError={formError}
          handleConfirm={handleEditSet}
          imageIds={imageIds}
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
