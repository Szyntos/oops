import { Award } from "../../../../../hooks/Edition/useAwardsSection";
import { Styles } from "../../../../../utils/Styles";
import { AwardImage } from "../../../../images/AwardImage";

type AwardCardProps = {
  award: Award;
  isSelected: boolean;
  onSelectClick: () => void;
};

export const AwardCard = ({
  award,
  isSelected,
  onSelectClick,
}: AwardCardProps) => {
  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: isSelected ? "pink" : undefined,
      }}
    >
      <AwardImage id={award.imageFileId ?? undefined} size="l" />
      <div>{award.awardName}</div>
      <div style={styles.subtitle}>{award.awardType}</div>

      <button onClick={onSelectClick}>
        {isSelected ? "unselect" : "select"}
      </button>
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
