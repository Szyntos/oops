import { Bonus } from "../../../hooks/StudentProfile";
import { Section } from "./Card/Section";
import { CustomImageList } from "./ImageList";

type BonusesCardProps = {
  bonuses: Bonus[];
};

export const BonusesCard = ({ bonuses }: BonusesCardProps) => {
  return (
    <Section title="Bonusy">
      <CustomImageList
        items={bonuses.map((b) => ({ bonus: b, type: "bonus" }))}
        type={"bonus"}
      />
    </Section>
  );
};
