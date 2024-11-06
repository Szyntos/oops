import { Dialog } from "@mui/material";
import { Styles } from "../../../../utils/Styles";
import { CloseHeader } from "../../../dialogs/CloseHeader";

import { useParams } from "react-router-dom";
import { useLevelSetsSection } from "../../../../hooks/Edition/useLevelSetsSection";
import { LevelSetsList } from "./LevelSetsList/LevelSetsList";
import { AddLevelFakeForm } from "./AddLevelFakeForm";
import { LevelSetCard } from "./LevelSetsList/LevelSetCard";
import { EMPTY_FIELD_STRING } from "../../../../utils/constants";

export const LevelSetsSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const {
    levelSets,
    imageIds,
    editionLevelSet,
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

    selectedLevelSet,

    handleDeleteSet,
  } = useLevelSetsSection(editionId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.container}>
      <button onClick={openAddSet}>add level set</button>

      <div>
        <div>Selected Set:</div>
        {/* TODO add selected level card */}
        {editionLevelSet ? (
          <LevelSetCard
            levelSet={editionLevelSet}
            isSelected={true}
            onSelectClick={() => handleSelectSet(editionLevelSet)}
            onEditClick={() =>
              handleEditSet(
                editionLevelSet.levels.map((l) => ({
                  name: l.name,
                  maxPoints: parseFloat(l.maximumPoints),
                  grade: l.grade,
                })),
              )
            }
            onDeleteClick={() => {
              handleDeleteSet(editionLevelSet);
            }}
          />
        ) : (
          EMPTY_FIELD_STRING
        )}
      </div>

      <LevelSetsList
        levelSets={levelSets}
        selectedLevelSet={editionLevelSet}
        handleSelect={handleSelectSet}
        handleEdit={openEditSet}
        handleDelete={handleDeleteSet}
        title={"All level sets"}
      />

      <Dialog open={isAddSetOpen} maxWidth={"lg"}>
        <CloseHeader onCloseClick={closeAddSet} />
        <AddLevelFakeForm
          formError={formError}
          initialLevelValues={[]}
          handleAdd={handleAddSet}
          imageIds={imageIds}
        />
      </Dialog>

      <Dialog open={isEditSetOpen} maxWidth={"lg"}>
        <CloseHeader onCloseClick={closeEditSet} />
        <AddLevelFakeForm
          initialLevelValues={
            selectedLevelSet?.levels?.map((l, index) => {
              return {
                ordinal: index,
                name: l.name,
                maxPoints: parseInt(l.maximumPoints),
                grade: l.grade,
                imageId: l.imageFileId ?? undefined,
              };
            }) ?? []
          }
          formError={formError}
          handleAdd={handleEditSet}
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
