import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { Award } from "../../../../../hooks/Edition/useAwardsSection";
import { tokens } from "../../../../../tokens";
import { Styles } from "../../../../../utils/Styles";
import { Avatar } from "../../../../avatars/Avatar";
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
  const { openShowDialog } = useEditionSections();

  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: isSelected ? "pink" : undefined,
      }}
    >
      <Avatar id={award.award.imageFile?.fileId ?? undefined} size="l" />
      <div>{award.award.awardName}</div>
      <div style={styles.subtitle}>{award.award.awardType}</div>

      <SetupButtons
        isSelected={isSelected}
        handleSelect={onSelectClick}
        handleEdit={onEditClick}
        handleDelete={onDeleteClick}
        handleCopy={onCopyClick}
        handleShow={() => openShowDialog(award)}
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
    color: tokens.color.state.disabled,
  },
};
