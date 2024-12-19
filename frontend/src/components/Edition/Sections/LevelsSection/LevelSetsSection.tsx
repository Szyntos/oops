import { useParams } from "react-router-dom";
import { useLevelSetsSection } from "../../../../hooks/Edition/useLevelSetsSection";
import { LevelSetsList } from "./LevelSetsList/LevelSetsList";
import { AddSetForm } from "./AddSetForm/AddSetForm";
import { SelectedSetCard } from "./LevelSetsList/SelectedSetCard";
import { LoadingScreen } from "../../../../screens/Loading/LoadingScreen";
import { ErrorScreen } from "../../../../screens/Error/ErrorScreen";
import { CustomButton } from "../../../CustomButton";
import { CardsSection } from "../../CardsSection";
import { coordinatorStyles } from "../../../../utils/utils";
import { CustomDialog } from "../../../dialogs/CustomDialog";

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

  if (loading) return <LoadingScreen type="edition" />;
  if (error) return <ErrorScreen type="edition" />;

  return (
    <div style={coordinatorStyles.container}>
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

      <CustomDialog
        isOpen={isAddSetOpen}
        title="Dodaj zbiór poziomów"
        onCloseClick={closeAddSet}
        size="lg"
      >
        <AddSetForm
          formError={formError}
          initLevels={[]}
          handleConfirm={handleAddSet}
          imageIds={imageIds}
        />
      </CustomDialog>

      <CustomDialog
        isOpen={isEditSetOpen}
        title="Edytuj zbiór poziomów"
        onCloseClick={closeEditSet}
        size="lg"
      >
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
      </CustomDialog>
    </div>
  );
};
