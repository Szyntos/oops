import { LevelSet } from "../../../../../hooks/Edition/useLevelSetsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
import { SetupButtons } from "../../SetupButtons";

type LevelSetCardProps = {
  levelSet: LevelSet;
  isSelected: boolean;
  onSelectClick: () => void;
  onEditClick: () => void;
  handleDelete: () => void;
};

export const LevelSetCard = ({
  levelSet,
  isSelected,
  onSelectClick,
  onEditClick,
  handleDelete,
}: LevelSetCardProps) => {
  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: isSelected ? "pink" : undefined,
      }}
    >
      <div>[{levelSet.levelSetId}]</div>

      <div>
        {levelSet.levels.length > 0
          ? levelSet.levels.map((l) => (
              <div>
                {l.ordinalNumber + 1}. {l.levelName}, {l.minimumPoints}-
                {l.maximumPoints}
              </div>
            ))
          : EMPTY_FIELD_STRING}
      </div>

      <SetupButtons
        selected={isSelected}
        handleSelect={onSelectClick}
        handleEdit={onEditClick}
        handleDelete={handleDelete}
        disableCopy={true}
      />
    </div>
  );
};

const styles: Styles = {
  card: {
    border: "1px solid black",
    padding: 12,
  },
  subtitle: {
    color: "grey",
  },
};
