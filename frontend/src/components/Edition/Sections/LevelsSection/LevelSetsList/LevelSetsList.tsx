import { LevelSet } from "../../../../../hooks/Edition/useLevelSetsSection";
import { CardsSection } from "../../../CardsSection";
import { LevelSetCard } from "./LevelSetCard";

type LevelSetsListProps = {
  levelSets: LevelSet[];
  selectedLevelSet?: LevelSet;
  handleSelect: (levelSet: LevelSet) => void;
  handleEdit: (levelSet: LevelSet) => void;
  handleDelete: (levelSet: LevelSet) => void;
  handleCopy: (levelSet: LevelSet) => void;
  title: string;
};

export const LevelSetsList = ({
  levelSets,
  selectedLevelSet,
  handleSelect,
  handleEdit,
  handleDelete,
  handleCopy,
  title,
}: LevelSetsListProps) => {
  return (
    <CardsSection
      title={title}
      cards={levelSets.map((levelSet) => (
        <LevelSetCard
          key={levelSet.levelSet.levelSetId}
          levelSet={levelSet}
          isSelected={
            selectedLevelSet?.levelSet.levelSetId ===
            levelSet.levelSet.levelSetId
          }
          onSelectClick={() => handleSelect(levelSet)}
          onEditClick={() => handleEdit(levelSet)}
          onDeleteClick={() => {
            handleDelete(levelSet);
          }}
          onCopyClick={() => handleCopy(levelSet)}
        />
      ))}
    />
  );
};
