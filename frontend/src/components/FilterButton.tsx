import { tokens } from "../tokens";
import { Styles } from "../utils/Styles";
import { BACKGROUND_COLOR_ANIMATION } from "../utils/utils";
import { CustomText } from "./CustomText";

const BORDER_WIDTH = 2;

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
  return (
    <div onClick={onClick}>
      <CustomText
        color={isActive ? tokens.color.text.primary : tokens.color.accent.dark}
        style={{
          ...styles.button,
          backgroundColor: isActive ? tokens.color.accent.dark : undefined,
        }}
      >
        {option}
      </CustomText>
    </div>
  );
};

const styles: Styles = {
  button: {
    padding: 12 - BORDER_WIDTH,
    paddingTop: 12 - BORDER_WIDTH,
    paddingBottom: 12 - BORDER_WIDTH,
    borderRadius: 8,
    cursor: "pointer",
    transition: BACKGROUND_COLOR_ANIMATION,
    border: `${BORDER_WIDTH}px solid ${tokens.color.accent.dark}`,
  },
};
