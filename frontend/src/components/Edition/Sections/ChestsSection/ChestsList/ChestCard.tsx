import { Chest } from "../../../../../hooks/Edition/useChestsSection";
import { Styles } from "../../../../../utils/Styles";
import { Image } from "../../../../images/Image";
import { SetupButtons } from "../../SetupButtons";

type ChestCardProps = {
  chest: Chest;
  isSelected: boolean;
  onSelectClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onCopyClick: () => void;
};

export const ChestCard = ({
  chest,
  isSelected,
  onSelectClick,
  onEditClick,
  onDeleteClick,
  onCopyClick,
}: ChestCardProps) => {
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
