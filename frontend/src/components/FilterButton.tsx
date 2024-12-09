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
  return (
    <div onClick={onClick}>
      <CustomText
        color={isActive ? tokens.color.accent.dark : undefined}
        style={styles.button}
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
