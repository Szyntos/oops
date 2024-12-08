import { IconMapper } from "../IconMapper";
import { Styles } from "../../utils/Styles";
import { tokens } from "../../tokens";
import { CustomText } from "../CustomText";

type ChestsNavbarItem = {
  quantity: number;
  onClick: () => void;
};

export const ChestsNavbarItem = ({ quantity, onClick }: ChestsNavbarItem) => {
  return (
    <div style={styles.wrapper}>
      <IconMapper
        onClick={quantity > 0 ? onClick : undefined}
        icon="chest"
        style={styles.icon}
      />
      <CustomText style={styles.circle} size={tokens.font.small}>
        {quantity}
      </CustomText>
    </div>
  );
};

const styles: Styles = {
  wrapper: {
    position: "relative",
  },
  circle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    transform: "translate(25%, 25%)",
    borderRadius: "50%",
    width: tokens.padding.s,
    height: tokens.padding.s,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.color.accent.light,
  },
};
