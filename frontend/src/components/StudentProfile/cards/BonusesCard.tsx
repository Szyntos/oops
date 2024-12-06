import { Bonus } from "../../../hooks/StudentProfile";
import { EMPTY_FIELD_STRING } from "../../../utils/constants";
import { Styles } from "../../../utils/Styles";
import { AwardWithTooltip } from "../../images/AwardWithTooltip";
import { Section } from "./Card/Section";

type BonusesCardProps = {
  bonuses: Bonus[];
};

export const BonusesCard = ({ bonuses }: BonusesCardProps) => {
  return (
    <Section title="Bonusy">
      <div style={styles.bonusesContainer}>
        {bonuses.length === 0 && <div>{EMPTY_FIELD_STRING}</div>}
        {bonuses.map((bonus) => (
          <AwardWithTooltip key={bonus.award.id} bonus={bonus} size="s" />
        ))}
      </div>
    </Section>
  );
};

const styles: Styles = {
  bonusesContainer: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
};
