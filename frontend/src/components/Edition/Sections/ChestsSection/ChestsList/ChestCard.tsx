import { SetupChestsQuery } from "../../../../../graphql/setupChests.graphql.types";
import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { Chest } from "../../../../../hooks/Edition/useChestsSection";
import { tokens } from "../../../../../tokens";
import {
  coordinatorStyles,
  getCardStyles,
  isChestActive,
} from "../../../../../utils/utils";
import { Avatar } from "../../../../avatars/Avatar";
import { CustomText } from "../../../../CustomText";
import {
  BonusItem,
  CustomImageList,
} from "../../../../StudentProfile/cards/ImageList";
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

export type Award =
  SetupChestsQuery["listSetupChests"][number]["chest"]["chestAward"];

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
  const awardItems: BonusItem[] = chest.chest.chestAward.map((a) => ({
    bonus: {
      id: a.award.awardId,
      name: a.award.awardName,
      description: a.award.description,
      imageId: a.award.imageFile?.fileId ?? "",
      maxUsage: a.award.maxUsages,
      typeValue: parseFloat(a.award.awardValue),
      type: a.award.awardType,
    },
    type: "bonus",
  }));

  return (
    <div style={getCardStyles(isSelected)}>
      <div style={coordinatorStyles.avatarContainer}>
        <Avatar id={chest.chest.imageFile?.fileId} size="l" />
        <div style={{ ...coordinatorStyles.textContainer, gap: 12 }}>
          <div style={coordinatorStyles.textContainer}>
            <CustomText style={coordinatorStyles.title}>
              {chest.chest.chestType}
            </CustomText>
            <CustomText color={tokens.color.text.secondary}>
              łupy do zebrania: {chest.chest.awardBundleCount}
            </CustomText>
          </div>

          <CustomImageList items={awardItems} type="bonus" />
        </div>
      </div>

      <SetupButtons
        isSelected={isSelected}
        permissions={chest.permissions}
        handleSelect={onSelectClick}
        handleEdit={onEditClick}
        handleDelete={onDeleteClick}
        handleCopy={onCopyClick}
        handleShow={() => openShowDialog(chest, "chest")}
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
