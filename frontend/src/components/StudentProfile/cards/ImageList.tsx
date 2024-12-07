import { Bonus, Level } from "../../../hooks/StudentProfile";
import { Styles } from "../../../utils/Styles";
import { CustomText } from "../../CustomText";
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
  current: boolean;
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
          shadow={item.current}
        />
      );
    }
    return (
      <AwardWithTooltip
        key={item.bonus.award.id}
        bonus={item.bonus}
        size="xs"
      />
    );
  };

  return (
    <>
      {items && items.length > 0 ? (
        <div style={styles.container}>
          {items.map((item) => getImage(item))}
        </div>
      ) : (
        <CustomText>brak :(</CustomText>
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
