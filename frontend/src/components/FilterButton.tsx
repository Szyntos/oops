import { useState } from "react";
import { tokens } from "../tokens";
import { Styles } from "../utils/Styles";
import { BACKGROUND_COLOR_ANIMATION } from "../utils/utils";
import { CustomText } from "./CustomText";

type FilterButtonProps = {
  option: string;
  isActive: boolean;
  onClick: () => void;
};

export const FilterButton = ({
  option,
  isActive,
  onClick,
}: FilterButtonProps) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CustomText
        style={{
          ...styles.button,
          backgroundColor:
            isActive || hovered ? tokens.color.accent.dark : undefined,
          cursor: hovered ? "pointer" : "auto",
        }}
        onClick={onClick}
      >
        {option}
      </CustomText>
    </div>
  );
};

const styles: Styles = {
  button: {
    padding: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 8,
    cursor: "pointer",
    transition: BACKGROUND_COLOR_ANIMATION,
  },
};
