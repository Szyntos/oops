import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { useEditionSelection } from "../../../../../hooks/common/useEditionSelection";
import { Chest } from "../../../../../hooks/Edition/useChestsSection";
import { Styles } from "../../../../../utils/Styles";
import { isChestActive } from "../../../../../utils/utils";
import { Image } from "../../../../images/Image";
import { SetupButtons } from "../../SetupButtons";

type ChestCardProps = {
  chest: Chest;
  isSelected: boolean;
  onSelectClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onCopyClick: () => void;
  onChestActivateClick: () => void;
};

export const ChestCard = ({
  chest,
  isSelected,
  onSelectClick,
  onEditClick,
  onDeleteClick,
  onCopyClick,
  onChestActivateClick,
}: ChestCardProps) => {
  const { openShowDialog } = useEditionSections();
  const { selectedEdition } = useEditionSelection();

  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: isSelected ? "pink" : undefined,
      }}
    >
      <Image
        id={chest.chest.imageFile?.fileId ?? undefined}
        size={32}
        disabled={false}
      />
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
          selectedEdition?.editionId ?? "",
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
    color: "grey",
  },
};
