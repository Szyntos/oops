import { Bonus } from "../../../hooks/StudentProfile";
import { Section } from "./Section/Section";
import { CustomImageList } from "./ImageList";
import { AwardTooltipProps } from "../../avatars/AwardWithTooltip";

type BonusesCardProps = {
  bonuses: Bonus[];
};

export const BonusesCard = ({ bonuses }: BonusesCardProps) => {
  const awardItems: AwardTooltipProps[] = bonuses.map((b) => ({
    id: b.award.id,
    updatedAt: b.updatedAt,
    createdAt: b.createdAt,
    name: b.award.name,
    description: b.award.description,
    value: b.award.value,
    imageId: b.award.imgId,
  }));

  return (
    <Section title="Łupy">
      <CustomImageList
        items={awardItems.map((b) => ({ bonus: b, type: "bonus" }))}
        type="bonus"
      />
    </Section>
  );
};
