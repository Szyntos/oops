import { Dialog } from "@mui/material";
import { Styles } from "../../../../utils/Styles";
import { CloseHeader } from "../../../dialogs/CloseHeader";

import { useParams } from "react-router-dom";
import { useLevelSetsSection } from "../../../../hooks/Edition/useLevelSetsSection";
import { LevelSetsList } from "./LevelSetsList/LevelSetsList";
import { AddLevelFakeForm } from "./AddLevelFakeForm";

export const LevelSetsSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const {
    levelSets,
    selectedLevelSets,
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

      <LevelSetsList
        levelSets={selectedLevelSets}
        selectedLevelSets={selectedLevelSets}
        handleSelect={handleSelectSet}
        title={"Selected level set"}
        handleEdit={openEditSet}
        handleDelete={handleDeleteSet}
      />
      <LevelSetsList
        levelSets={levelSets}
        selectedLevelSets={selectedLevelSets}
        handleSelect={handleSelectSet}
        title={"All level sets"}
        handleEdit={openEditSet}
        handleDelete={handleDeleteSet}
      />

      <Dialog open={isAddSetOpen}>
        <CloseHeader onCloseClick={closeAddSet} />
        <AddLevelFakeForm
          formError={formError}
          initialLevelValues={[]}
          handleAdd={handleAddSet}
        />
      </Dialog>

      <Dialog open={isEditSetOpen}>
        <CloseHeader onCloseClick={closeEditSet} />
        <AddLevelFakeForm
          initialLevelValues={
            selectedLevelSet?.levels?.map((l, index) => {
              return {
                ordinal: index,
                name: l.levelName,
                maxPoints: parseInt(l.maximumPoints),
                grade: l.grade,
              };
            }) ?? []
          }
          formError={formError}
          handleAdd={handleEditSet}
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
