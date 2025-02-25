import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { LevelSet } from "../../../../../hooks/Edition/useLevelSetsSection";
import { tokens } from "../../../../../tokens";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { coordinatorStyles, getCardStyles } from "../../../../../utils/utils";
import { Avatar } from "../../../../avatars/Avatar";
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

// poziomy: id, ocena, max point, nazwa

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
      <div style={{ ...coordinatorStyles.textContainer, gap: 8, flex: 1 }}>
        {levelSet.levelSet.levels.length > 0 ? (
          levelSet.levelSet.levels.map((l) => (
            <div style={coordinatorStyles.avatarContainer}>
              <Avatar id={l.imageFile?.fileId} size={"xs"} />
              <div style={coordinatorStyles.textContainer}>
                <CustomText>{l.levelName}</CustomText>
                <CustomText color={tokens.color.text.secondary}>
                  {l.minimumPoints}pkt - {l.maximumPoints}pkt
                </CustomText>
              </div>
            </div>
          ))
        ) : (
          <CustomText>{EMPTY_FIELD_STRING}</CustomText>
        )}
      </div>

      <SetupButtons
        isSelected={isSelected}
        permissions={levelSet.permissions}
        handleSelect={onSelectClick}
        handleEdit={onEditClick}
        handleDelete={onDeleteClick}
        handleCopy={onCopyClick}
        handleShow={() => openShowDialog(levelSet, "level")}
      />
    </div>
  );
};
