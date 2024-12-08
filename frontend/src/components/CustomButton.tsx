import { useState } from "react";
import { tokens } from "../tokens";
import { Styles } from "../utils/Styles";
import { CustomText } from "./CustomText";

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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)} // Handle hover start
      onMouseLeave={() => setIsHovered(false)} // Handle hover end
    >
      <CustomText
        style={{
          ...styles.button,
          ...(disabled ? styles.disabled : undefined),
          ...(isHovered && !disabled ? styles.hoovered : undefined),
        }}
        size={tokens.font.text}
      >
        {children}
      </CustomText>
    </div>
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
  },
  disabled: {
    cursor: "auto",
    backgroundColor: "grey",
  },
  hoovered: {
    opacity: 0.9,
  },
};
