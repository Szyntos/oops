import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { LevelSet } from "../../../../../hooks/Edition/useLevelSetsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
import { SetupButtons } from "../../SetupButtons";

type LevelSetCardProps = {
  levelSet: LevelSet;
  isSelected: boolean;
  onSelectClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onCopyClick: () => void;
};

export const LevelSetCard = ({
  levelSet,
  isSelected,
  onSelectClick,
  onEditClick,
  onDeleteClick,
  onCopyClick,
}: LevelSetCardProps) => {
  const { openShowDialog } = useEditionSections();

  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: isSelected ? "pink" : undefined,
      }}
    >
      <div>[{levelSet.levelSet.levelSetId}]</div>

      <div>
        {levelSet.levelSet.levels.length > 0
          ? levelSet.levelSet.levels.map((l) => (
              <div>
                {l.ordinalNumber + 1}. {l.levelName}, {l.minimumPoints}-
                {l.maximumPoints}
              </div>
            ))
          : EMPTY_FIELD_STRING}
      </div>

      <SetupButtons
        isSelected={isSelected}
        permissions={levelSet.permissions}
        handleSelect={onSelectClick}
        handleEdit={onEditClick}
        handleDelete={onDeleteClick}
        handleCopy={onCopyClick}
        handleShow={() => openShowDialog(levelSet)}
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
