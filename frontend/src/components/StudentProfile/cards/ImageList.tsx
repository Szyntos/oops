import { Level } from "../../../hooks/StudentProfile";
import { Styles } from "../../../utils/Styles";
import { CustomText } from "../../CustomText";
import { AnimalWithTooltip } from "../../avatars/AnimalWithTooltip";
import { AvatarShadowSize } from "../../avatars/Avatar";
import {
  AwardWithTooltip,
  AwardTooltipProps,
} from "../../avatars/AwardWithTooltip";

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
  shadow: AvatarShadowSize;
  type: "animal";
};

export type BonusItem = {
  bonus: AwardTooltipProps;
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
          shadow={item.shadow}
        />
      );
    }
    return (
      <AwardWithTooltip key={item.bonus.id} props={item.bonus} size="xs" />
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
