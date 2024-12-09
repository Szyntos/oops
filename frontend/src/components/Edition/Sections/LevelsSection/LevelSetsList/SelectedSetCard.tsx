import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { LevelSet } from "../../../../../hooks/Edition/useLevelSetsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
import { AnimalWithTooltip } from "../../../../images/AnimalWithTooltip";
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
    <div style={styles.card}>
      <div>[{levelSet.levelSet.levelSetId}]</div>

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
                }}
                size={"m"}
              />
            ))}
          </div>
        ) : (
          EMPTY_FIELD_STRING
        )}
      </div>

      <SetupButtons
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
    backgroundColor: "lightblue",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  levelContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
  subtitle: {
    color: "grey",
  },
};
