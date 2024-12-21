import { CSSProperties } from "react";
import { tokens } from "../../../../../tokens";
import { Styles } from "../../../../../utils/Styles";
import { Icon, IconMapper } from "../../../../IconMapper";
import { HooverWrapper } from "../../../../HooverWrapper";

type RowButtonProps = {
  onClick: () => void;
  isDisabled: boolean;
  color?: string;
  icon: Icon;
  type?: "button" | "submit" | "reset";
};

export const RowButton = ({
  onClick,
  isDisabled,
  color,
  icon,
  type = "button",
}: RowButtonProps) => {
  const getButtonStyle = (): CSSProperties => {
    if (isDisabled) {
      return { ...styles.button, ...styles.disabled };
    }
    return {
      ...styles.button,
      backgroundColor: color ?? tokens.color.accent.light,
    };
  };

  return isDisabled ? (
    <button type={type} style={getButtonStyle()} onClick={onClick}>
      <IconMapper icon={icon} />
    </button>
  ) : (
    <HooverWrapper>
      <button type={type} style={getButtonStyle()} onClick={onClick}>
        <IconMapper icon={icon} />
      </button>
    </HooverWrapper>
  );
};

const styles: Styles = {
  button: {
    display: "flex",
    border: "none",
    backgroundColor: tokens.color.accent.light,
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
  },
  disabled: {
    backgroundColor: tokens.color.state.disabled,
    cursor: "auto",
  },
};
