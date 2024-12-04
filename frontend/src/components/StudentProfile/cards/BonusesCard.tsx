import { Bonus } from "../../../hooks/StudentProfile";
import { EMPTY_FIELD_STRING } from "../../../utils/constants";
import { Styles } from "../../../utils/Styles";
import { AwardWithTooltip } from "../../images/AwardWithTooltip";

type BonusesCardProps = {
  bonuses: Bonus[];
};

export const BonusesCard = ({ bonuses }: BonusesCardProps) => {
  return (
    <div style={styles.card}>
      <div style={styles.title}>Bonusy</div>
      <div style={styles.bonusesContainer}>
        {bonuses.length === 0 && <div>{EMPTY_FIELD_STRING}</div>}
        {bonuses.map((bonus) => (
          <AwardWithTooltip key={bonus.award.id} bonus={bonus} size="s" />
        ))}
      </div>
    </div>
  );
};

const styles: Styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid blue",
    gap: 12,
    padding: 24,
  },
  title: {
    fontWeight: "bold",
  },
  bonusesContainer: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
};
