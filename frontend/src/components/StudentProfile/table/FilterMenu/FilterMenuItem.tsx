import { useState } from "react";
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
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CustomText
        color={item.lightColor}
        onClick={onClick}
        style={{
          ...styles.item,
          backgroundColor: isSelected || hovered ? item.darkColor : undefined,
          border: `${BORDER_WIDTH}px solid ${isSelected || hovered ? item.darkColor : item.lightColor}`,
          cursor: hovered ? "pointer" : "auto",
        }}
      >
        {item.name}
      </CustomText>
    </div>
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
