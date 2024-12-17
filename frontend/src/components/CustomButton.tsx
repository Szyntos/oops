import { tokens } from "../tokens";
import { Styles } from "../utils/Styles";
import { CustomText } from "./CustomText";
import { HooverWrapper } from "./HooverWrapper";

type CustomButtonProps = {
  onClick: () => void;
  children: string;
  disabled?: boolean;
};

export const CustomButton = ({
  onClick,
  children,
  disabled,
}: CustomButtonProps) => {
  return disabled ? (
    <CustomText
      style={{
        ...styles.button,
        ...(disabled ? styles.disabled : undefined),
      }}
      size={tokens.font.text}
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
    >
      {children}
    </CustomText>
  ) : (
    <HooverWrapper>
      <CustomText
        style={{
          ...styles.button,
          ...(disabled ? styles.disabled : undefined),
        }}
        size={tokens.font.text}
        onClick={() => {
          if (!disabled) {
            onClick();
          }
        }}
      >
        {children}
      </CustomText>
    </HooverWrapper>
  );
};

const styles: Styles = {
  button: {
    backgroundColor: tokens.color.accent.dark,
    padding: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 6,
    cursor: "pointer",
    display: "inline-block",
    userSelect: "none",
  },
  disabled: {
    cursor: "auto",
    backgroundColor: tokens.color.state.disabled,
  },
};
