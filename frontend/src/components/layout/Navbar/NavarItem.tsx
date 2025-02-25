import { tokens } from "../../../tokens";
import { Styles } from "../../../utils/Styles";
import { COLOR_TRANSITION_ANIMATION } from "../../../utils/utils";
import { CustomText } from "../../CustomText";

type NavbarProps = {
  onClick?: () => void;
  isActive?: boolean;
  title: string;
  color?: string;
  bold?: boolean;
  size?: number;
};

export const NavbarItem = ({
  onClick,
  isActive,
  title,
  color,
  bold,
  size,
}: NavbarProps) => {
  const isBold = () => {
    if (bold !== undefined) {
      return bold;
    }
    return Boolean(onClick);
  };

  return (
    <div
      onClick={onClick}
      style={{
        ...styles.navbarItem,
        ...(onClick && styles.clickable),
      }}
    >
      <CustomText
        style={{ ...(isActive && styles.active) }}
        color={color}
        bold={isBold()}
        size={size ?? tokens.font.text}
      >
        {title}
      </CustomText>
    </div>
  );
};

const styles: Styles = {
  navbarItem: {
    height: "100%",
    alignContent: "center",
  },
  active: {
    color: tokens.color.accent.light,
    transition: COLOR_TRANSITION_ANIMATION,
  },
  clickable: {
    cursor: "pointer",
  },
};
