import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { Award } from "../../../../../hooks/Edition/useAwardsSection";
import { cardStyles, getCardStyles } from "../../../../../utils/utils";
import { Avatar } from "../../../../avatars/Avatar";
import { CustomText } from "../../../../CustomText";
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
    <div style={getCardStyles(isSelected)}>
      <div style={cardStyles.avatarContainer}>
        <Avatar id={award.award.imageFile?.fileId} size="s" />
        <div style={cardStyles.textContainer}>
          <CustomText style={cardStyles.title}>
            {award.award.awardName}
          </CustomText>
          <CustomText>{award.award.awardType}</CustomText>
        </div>
      </div>

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
