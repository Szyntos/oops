import { Dialog } from "@mui/material";
import { Styles } from "../../../../utils/Styles";
import { CloseHeader } from "../../../dialogs/CloseHeader";

import { useParams } from "react-router-dom";
import { useLevelSetsSection } from "../../../../hooks/Edition/useLevelSetsSection";
import { LevelSetsList } from "./LevelSetsList/LevelSetsList";
import { AddSetForm } from "./AddSetForm/AddSetForm";
import { SelectedSetCard } from "./LevelSetsList/SelectedSetCard";
import { CustomButton } from "../../../CustomButton";
import { CardsSection } from "../../CardsSection";

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

    handleCopySet,
  } = useLevelSetsSection(editionId);

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.container}>
      <CustomButton onClick={openAddSet}>Dodaj zbiór poziomów</CustomButton>

      <CardsSection
        title={"Wybrany zbiór poziomów"}
        cards={
          activeSet
            ? [
                <SelectedSetCard
                  levelSet={activeSet}
                  onSelectClick={() => handleSelectSet(activeSet)}
                  onEditClick={() => openEditSet(activeSet)}
                  onDeleteClick={() => {
                    handleDeleteSet(activeSet);
                  }}
                  onCopyClick={() => handleCopySet(activeSet)}
                />,
              ]
            : []
        }
      />

      <LevelSetsList
        levelSets={levelSets}
        selectedLevelSet={activeSet}
        handleSelect={handleSelectSet}
        handleEdit={openEditSet}
        handleDelete={handleDeleteSet}
        handleCopy={handleCopySet}
        title={"Wszystkie zbiory poziomów"}
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
            selectedToEditSet?.levelSet.levels?.map((l, index) => ({
              ...l,
              ordinal: index,
              minPoints: parseFloat(l.minimumPoints),
              maxPoints: parseFloat(l.maximumPoints),
              imageId: l.imageFile?.fileId ?? "-1",
              name: l.levelName,
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
    gap: 20,
  },
};
