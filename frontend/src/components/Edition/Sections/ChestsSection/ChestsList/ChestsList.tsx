import { Chest } from "../../../../../hooks/Edition/useChestsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
import { ChestCard } from "./ChestCard";

type ChestsListProps = {
  chests: Chest[];
  selectedChests: Chest[];
  handleSelectChest: (award: Chest) => void;
  handleEditChest: (award: Chest) => void;
  handleDeleteChest: (award: Chest) => void;
  handleCopyChest: (award: Chest) => void;
  title: string;
};

export const ChestsList = ({
  chests,
  selectedChests,
  handleSelectChest,
  handleEditChest,
  handleDeleteChest,
  handleCopyChest,
  title,
}: ChestsListProps) => {
  return (
    <div>
      <div style={styles.title}>{title}</div>
      <div style={styles.container}>
        {chests.length !== 0
          ? chests.map((chest) => (
              <ChestCard
                key={chest.chestId}
                chest={chest}
                isSelected={selectedChests.some(
                  (c) => c.chestId === chest.chestId,
                )}
                onSelectClick={() => handleSelectChest(chest)}
                onEditClick={() => handleEditChest(chest)}
                onDeleteClick={() => handleDeleteChest(chest)}
                onCopyClick={() => handleCopyChest(chest)}
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
