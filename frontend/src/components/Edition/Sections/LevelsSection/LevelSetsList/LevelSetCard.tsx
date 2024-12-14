import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { LevelSet } from "../../../../../hooks/Edition/useLevelSetsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { cardStyles, getCardStyles } from "../../../../../utils/utils";
import { CustomText } from "../../../../CustomText";
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
    <div style={getCardStyles(isSelected)}>
      <div style={cardStyles.textContainer}>
        {levelSet.levelSet.levels.length > 0
          ? levelSet.levelSet.levels.map((l) => (
              <CustomText>
                {l.ordinalNumber + 1}. {l.levelName}, {l.minimumPoints}-
                {l.maximumPoints}
              </CustomText>
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
