import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { Award } from "../../../../../hooks/Edition/useAwardsSection";
import { tokens } from "../../../../../tokens";
import {
  coordinatorStyles,
  getAwardMaxUsageString,
  getAwardValueString,
  getCardStyles,
  mapAwardTypeToPolish,
} from "../../../../../utils/utils";
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
      <div style={coordinatorStyles.avatarContainer}>
        <Avatar id={award.award.imageFile?.fileId} size="s" />
        <div style={coordinatorStyles.textContainer}>
          <CustomText style={coordinatorStyles.title}>
            {award.award.awardName}
          </CustomText>
          <CustomText>{mapAwardTypeToPolish(award.award.awardType)}</CustomText>
          <CustomText>
            {getAwardValueString(
              award.award.awardType,
              parseFloat(award.award.awardValue),
            )}
          </CustomText>
        </div>
      </div>

      <CustomText color={tokens.color.text.secondary}>
        {getAwardMaxUsageString(award.award.maxUsages)}
      </CustomText>

      <SetupButtons
        isSelected={isSelected}
        handleSelect={onSelectClick}
        handleEdit={onEditClick}
        handleDelete={onDeleteClick}
        handleCopy={onCopyClick}
        handleShow={() => openShowDialog(award, "award")}
        permissions={award.permissions}
      />
    </div>
  );
};
