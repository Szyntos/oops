import { Award } from "../../../../../hooks/Edition/useAwardsSection";
import { Styles } from "../../../../../utils/Styles";
import { AwardImage } from "../../../../images/AwardImage";
import { SetupButtons } from "../../SetupButtons";

type AwardCardProps = {
  award: Award;
  isSelected: boolean;
  onSelectClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onCopyClick: () => void;
};

export const AwardCard = ({
  award,
  isSelected,
  onSelectClick,
  onEditClick,
  onDeleteClick,
  onCopyClick,
}: AwardCardProps) => {
  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: isSelected ? "pink" : undefined,
      }}
    >
      <AwardImage id={award.award.imageFile?.fileId ?? undefined} size="l" />
      <div>{award.award.awardName}</div>
      <div style={styles.subtitle}>{award.award.awardType}</div>

      <SetupButtons
        isSelected={isSelected}
        handleSelect={onSelectClick}
        handleEdit={onEditClick}
        handleDelete={onDeleteClick}
        handleCopy={onCopyClick}
        permissions={award.permissions}
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
