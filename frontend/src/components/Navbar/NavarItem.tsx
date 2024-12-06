import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";
import { CustomText } from "../CustomText";

type NavbarProps = {
  onClick?: () => void;
  isActive?: boolean;
  title: string;
};

export const NavbarItem = ({ onClick, isActive, title }: NavbarProps) => {
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.navbarItem,
        ...(onClick && styles.clickable),
      }}
    >
      <CustomText style={{ ...(isActive && styles.active) }}>
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
    color: tokens.color.accent.dark,
    transition: "color 0.2s ease",
  },
  clickable: {
    cursor: "pointer",
  },
};
