import { Chest } from "../../../../../hooks/Edition/useChestsSection";
import { CardsSection } from "../../../CardsSection";
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
  editionId: number;
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
  editionId,
}: ChestsListProps) => {
  return (
    <CardsSection
      cards={chests.map((chest) => (
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
          editionId={editionId}
        />
      ))}
      title={title}
    ></CardsSection>
  );
};
