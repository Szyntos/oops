import { Award } from "../../../../../hooks/Edition/useAwardsSection";
import { CardsSection } from "../../../CardsSection";
import { AwardCard } from "./AwardCard";

type AwardsListProps = {
  awards: Award[];
  selectedAwards: Award[];
  handleSelectAward: (award: Award) => void;
  handleEditAward: (award: Award) => void;
  handleDeleteAward: (award: Award) => void;
  handleCopyAward: (award: Award) => void;
  title: string;
};

export const AwardsList = ({
  awards,
  selectedAwards,
  handleSelectAward,
  handleEditAward,
  handleDeleteAward,
  handleCopyAward,
  title,
}: AwardsListProps) => {
  return (
    <CardsSection
      title={title}
      cards={awards.map((award) => (
        <AwardCard
          key={award.award.awardId}
          award={award}
          isSelected={selectedAwards.some(
            (a) => a.award.awardId === award.award.awardId,
          )}
          onSelectClick={() => handleSelectAward(award)}
          onEditClick={() => handleEditAward(award)}
          onDeleteClick={() => handleDeleteAward(award)}
          onCopyClick={() => handleCopyAward(award)}
        />
      ))}
    />
  );
};
