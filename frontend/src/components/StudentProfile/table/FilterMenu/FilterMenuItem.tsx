import { Styles } from "../../../../utils/Styles";
import { BACKGROUND_COLOR_ANIMATION } from "../../../../utils/utils";
import { CustomText } from "../../../CustomText";
import { FilterMenuItemType } from "./FilterMenu";

const BORDER_WIDTH = 2;

export type FilterMenuItemProps = {
  item: FilterMenuItemType;
  isSelected: boolean;
  onClick: () => void;
};

export const FilterMenuItem = ({
  item,
  isSelected,
  onClick,
}: FilterMenuItemProps) => {
  return (
    <CustomText
      color={item.lightColor}
      onClick={onClick}
      style={{
        ...styles.item,
        backgroundColor: isSelected ? item.darkColor : undefined,
        border: `${BORDER_WIDTH}px solid ${item.darkColor}`,
      }}
    >
      {item.name}
    </CustomText>
  );
};

const styles: Styles = {
  item: {
    padding: 12 - BORDER_WIDTH,
    borderRadius: 8,
    cursor: "pointer",
    transition: BACKGROUND_COLOR_ANIMATION,
  },
};
