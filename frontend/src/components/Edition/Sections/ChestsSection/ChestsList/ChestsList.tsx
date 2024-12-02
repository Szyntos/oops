import { Chest } from "../../../../../hooks/Edition/useChestsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
import { ChestCard } from "./ChestCard";

type ChestsListProps = {
  chests: Chest[];
  selectedChests: Chest[];
  handleSelectChest: (chest: Chest) => void;
  handleEditChest: (chest: Chest) => void;
  handleDeleteChest: (chest: Chest) => void;
  handleCopyChest: (chest: Chest) => void;
  handleActivateChest: (chest: Chest) => void;
  title: string;
};

export const ChestsList = ({
  chests,
  selectedChests,
  handleSelectChest,
  handleEditChest,
  handleDeleteChest,
  handleCopyChest,
  handleActivateChest,
  title,
}: ChestsListProps) => {
  return (
    <div>
      <div style={styles.title}>{title}</div>
      <div style={styles.container}>
        {chests.length !== 0
          ? chests.map((chest) => (
              <ChestCard
                key={chest.chest.chestId}
                chest={chest}
                isSelected={selectedChests.some(
                  (c) => c.chest.chestId === chest.chest.chestId,
                )}
                onSelectClick={() => handleSelectChest(chest)}
                onEditClick={() => handleEditChest(chest)}
                onDeleteClick={() => handleDeleteChest(chest)}
                onCopyClick={() => handleCopyChest(chest)}
                onChestActivateClick={() => handleActivateChest(chest)}
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
