import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { LevelSet } from "../../../../../hooks/Edition/useLevelSetsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
import { getCardStyles } from "../../../../../utils/utils";
import { AnimalWithTooltip } from "../../../../avatars/AnimalWithTooltip";
import { CustomText } from "../../../../CustomText";
import { SetupButtons } from "../../SetupButtons";

type SelectedSetCardProps = {
  levelSet: LevelSet;
  onSelectClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onCopyClick: () => void;
};

export const SelectedSetCard = ({
  levelSet,
  onSelectClick,
  onEditClick,
  onDeleteClick,
  onCopyClick,
}: SelectedSetCardProps) => {
  const { openShowDialog } = useEditionSections();

  return (
    <div style={getCardStyles(true)}>
      <div>
        {levelSet.levelSet.levels.length > 0 ? (
          <div style={styles.levelContainer}>
            {levelSet.levelSet.levels.map((l) => (
              <AnimalWithTooltip
                level={{
                  ...l,
                  realLevelNumber: l.ordinalNumber + 1,
                  imageId: l.imageFile?.fileId ?? undefined,
                  minimumPoints: parseFloat(l.minimumPoints),
                  maximumPoints: parseFloat(l.maximumPoints),
                  name: l.levelName,
                  grade: parseFloat(l.grade),
                }}
                size={"m"}
              />
            ))}
          </div>
        ) : (
          <CustomText>{EMPTY_FIELD_STRING}</CustomText>
        )}
      </div>

      <SetupButtons
        permissions={levelSet.permissions}
        isSelected={true}
        handleSelect={onSelectClick}
        handleEdit={onEditClick}
        handleDelete={onDeleteClick}
        handleCopy={onCopyClick}
        handleShow={() => openShowDialog(levelSet, "level")}
      />
    </div>
  );
};

const styles: Styles = {
  levelContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
