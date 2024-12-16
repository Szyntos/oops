import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { Chest } from "../../../../../hooks/Edition/useChestsSection";
import {
  cardStyles,
  getCardStyles,
  isChestActive,
} from "../../../../../utils/utils";
import { Avatar } from "../../../../avatars/Avatar";
import { CustomText } from "../../../../CustomText";
import { SetupButtons } from "../../SetupButtons";

type ChestCardProps = {
  chest: Chest;
  isSelected: boolean;
  onSelectClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onCopyClick: () => void;
  onChestActivateClick: () => void;
  editionId: number;
};

export const ChestCard = ({
  chest,
  isSelected,
  onSelectClick,
  onEditClick,
  onDeleteClick,
  onCopyClick,
  onChestActivateClick,
  editionId,
}: ChestCardProps) => {
  const { openShowDialog } = useEditionSections();

  return (
    <div style={getCardStyles(isSelected)}>
      <div style={cardStyles.avatarContainer}>
        <Avatar id={chest.chest.imageFile?.fileId} size="xs" />
        <div style={cardStyles.textContainer}>
          <CustomText style={cardStyles.title}>
            {chest.chest.chestType}
          </CustomText>
        </div>
      </div>

      <SetupButtons
        isSelected={isSelected}
        permissions={chest.permissions}
        handleSelect={onSelectClick}
        handleEdit={onEditClick}
        handleDelete={onDeleteClick}
        handleCopy={onCopyClick}
        handleShow={() => openShowDialog(chest)}
        handleMarkChestActiveness={onChestActivateClick}
        isChestActive={isChestActive(
          chest.chest.chestEdition.map((e) => ({
            id: e?.edition.editionId ?? "-1",
            active: Boolean(e?.active),
          })),
          editionId.toString(),
        )}
      />
    </div>
  );
};
