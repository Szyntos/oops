import { Award } from "../../../../../hooks/Edition/useAwardsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
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
    <div>
      <div style={styles.title}>{title}</div>
      <div style={styles.container}>
        {awards.length !== 0
          ? awards.map((award) => (
              <AwardCard
                key={award.awardId}
                award={award}
                isSelected={selectedAwards.some(
                  (a) => a.awardId === award.awardId,
                )}
                onSelectClick={() => handleSelectAward(award)}
                onEditClick={() => handleEditAward(award)}
                onDeleteClick={() => handleDeleteAward(award)}
                onCopyClick={() => handleCopyAward(award)}
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
