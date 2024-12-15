import { Bonus } from "../../../hooks/StudentProfile";
import { Section } from "./Section/Section";
import { CustomImageList } from "./ImageList";

type BonusesCardProps = {
  bonuses: Bonus[];
};

export const BonusesCard = ({ bonuses }: BonusesCardProps) => {
  return (
    <Section title="Łupy">
      <CustomImageList
        items={bonuses.map((b) => ({ bonus: b, type: "bonus" }))}
        type={"bonus"}
      />
    </Section>
  );
};
