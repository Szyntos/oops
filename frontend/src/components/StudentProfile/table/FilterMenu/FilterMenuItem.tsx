import { Styles } from "../../../../utils/Styles";
import { CustomText } from "../../../CustomText";

export type FilterMenuItemProps = {
  text: string;
  isSelected: boolean;
  lightColor: string;
  darkColor: string;
  onClick: () => void;
};

export const FilterMenuItem = ({
  text,
  isSelected,
  lightColor,
  darkColor,
  onClick,
}: FilterMenuItemProps) => {
  return (
    <div
      onClick={onClick}
      style={{
        ...styles.item,
        backgroundColor: isSelected ? darkColor : "transparent",
      }}
    >
      <CustomText color={lightColor}>{text}</CustomText>
    </div>
  );
};

const styles: Styles = {
  item: {
    padding: 12,
    borderRadius: 8,
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};
