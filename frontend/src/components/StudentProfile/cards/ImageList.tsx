import { Bonus, Level } from "../../../hooks/StudentProfile";
import { EMPTY_FIELD_STRING } from "../../../utils/constants";
import { Styles } from "../../../utils/Styles";
import { AnimalWithTooltip } from "../../images/AnimalWithTooltip";
import { AwardWithTooltip } from "../../images/AwardWithTooltip";

type CustomImageListProps =
  | {
      items: AnimalItem[];
      type: "animal";
    }
  | {
      items: BonusItem[];
      type: "bonus";
    };

export type AnimalItem = {
  level: Level;
  disabled: boolean;
  type: "animal";
};

export type BonusItem = {
  bonus: Bonus;
  type: "bonus";
};

export const CustomImageList = ({ items }: CustomImageListProps) => {
  const getImage = (item: AnimalItem | BonusItem) => {
    if (item.type === "animal") {
      return (
        <AnimalWithTooltip
          level={item.level}
          size={"xs"}
          disabled={item.disabled}
        />
      );
    }
    return (
      <AwardWithTooltip key={item.bonus.award.id} bonus={item.bonus} size="m" />
    );
  };

  return (
    <>
      {items && items.length > 0 ? (
        <div style={styles.container}>
          {items.map((item) => getImage(item))}
        </div>
      ) : (
        <div>{EMPTY_FIELD_STRING}</div>
      )}
    </>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
};
