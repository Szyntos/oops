import { Bonus } from "../../../hooks/StudentProfile";
import { EMPTY_FIELD_STRING } from "../../../utils/constants";
import { Styles } from "../../../utils/Styles";
import { CustomText } from "../../CustomText";
import { AwardWithTooltip } from "../../images/AwardWithTooltip";
import { Card } from "./Card/Card";

type BonusesCardProps = {
  bonuses: Bonus[];
};

export const BonusesCard = ({ bonuses }: BonusesCardProps) => {
  return (
    <Card>
      <CustomText>Bonusy</CustomText>
      <div style={styles.bonusesContainer}>
        {bonuses.length === 0 && <div>{EMPTY_FIELD_STRING}</div>}
        {bonuses.map((bonus) => (
          <AwardWithTooltip key={bonus.award.id} bonus={bonus} size="s" />
        ))}
      </div>
    </Card>
  );
};

const styles: Styles = {
  bonusesContainer: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
};
