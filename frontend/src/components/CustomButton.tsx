import { CSSProperties } from "react";
import { tokens } from "../tokens";
import { Styles } from "../utils/Styles";
import { CustomText } from "./CustomText";
import { HooverWrapper } from "./HooverWrapper";

type CustomButtonProps = {
  onClick: () => void;
  children: string;
  disabled?: boolean;
  color?: string;
};

export const CustomButton = ({
  onClick,
  children,
  disabled,
  color,
}: CustomButtonProps) => {
  const getButtonStyles = (): CSSProperties => {
    return {
      ...styles.button,
      ...(disabled ? styles.disabled : undefined),
      backgroundColor: color ?? tokens.color.accent.light,
    };
  };
  const buttonStyles = getButtonStyles();

  return disabled ? (
    <CustomText
      style={buttonStyles}
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
        style={buttonStyles}
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
