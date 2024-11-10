import { LevelSet } from "../../../../../hooks/Edition/useLevelSetsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
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
    <div>
      <div style={styles.title}>{title}</div>
      <div style={styles.container}>
        {levelSets.length !== 0
          ? levelSets.map((levelSet) => (
              <LevelSetCard
                key={levelSet.levelSetId}
                levelSet={levelSet}
                isSelected={
                  selectedLevelSet?.levelSetId === levelSet.levelSetId
                }
                onSelectClick={() => handleSelect(levelSet)}
                onEditClick={() => handleEdit(levelSet)}
                onDeleteClick={() => {
                  handleDelete(levelSet);
                }}
                onCopyClick={() => handleCopy(levelSet)}
              />
            ))
          : EMPTY_FIELD_STRING}
      </div>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  title: {
    color: "blue",
  },
};
