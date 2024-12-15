import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { Chest } from "../../../../../hooks/Edition/useChestsSection";
import { tokens } from "../../../../../tokens";
import { Styles } from "../../../../../utils/Styles";
import { isChestActive } from "../../../../../utils/utils";
import { Avatar } from "../../../../avatars/Avatar";
import { SetupButtons } from "../../SetupButtons";

type ChestCardProps = {
  chest: Chest;
  isSelected: boolean;
  onSelectClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onCopyClick: () => void;
  onChestActivateClick: () => void;
  editionId: number;
};

export const ChestCard = ({
  chest,
  isSelected,
  onSelectClick,
  onEditClick,
  onDeleteClick,
  onCopyClick,
  onChestActivateClick,
  editionId,
}: ChestCardProps) => {
  const { openShowDialog } = useEditionSections();

  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: isSelected ? "pink" : undefined,
      }}
    >
      <Avatar id={chest.chest.imageFile?.fileId} size="xs" />
      <div>[{chest.chest.chestId}]</div>
      <div style={styles.subtitle}>{chest.chest.chestType}</div>

      <SetupButtons
        isSelected={isSelected}
        permissions={chest.permissions}
        handleSelect={onSelectClick}
        handleEdit={onEditClick}
        handleDelete={onDeleteClick}
        handleCopy={onCopyClick}
        handleShow={() => openShowDialog(chest)}
        handleMarkChestActiveness={onChestActivateClick}
        isChestActive={isChestActive(
          chest.chest.chestEdition.map((e) => ({
            id: e?.edition.editionId ?? "-1",
            active: Boolean(e?.active),
          })),
          editionId.toString(),
        )}
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
    color: tokens.color.state.disabled,
  },
};
