import { LevelSet } from "../../../../../hooks/Edition/useLevelSetsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
import { LevelSetCard } from "./LevelSetCard";

type LevelSetsListProps = {
  levelSets: LevelSet[];
  selectedLevelSets: LevelSet[];
  handleSelect: (levelSet: LevelSet) => void;
  handleEdit: (levelSet: LevelSet) => void;
  handleDelete: (levelSet: LevelSet) => void;
  title: string;
};

export const LevelSetsList = ({
  levelSets,
  selectedLevelSets,
  handleSelect,
  handleEdit,
  handleDelete,
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
                isSelected={selectedLevelSets.some(
                  (ls) => ls.levelSetId === levelSet.levelSetId,
                )}
                onSelectClick={() => handleSelect(levelSet)}
                onEditClick={() => handleEdit(levelSet)}
                handleDelete={() => {
                  handleDelete(levelSet);
                }}
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
