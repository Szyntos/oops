import { tokens } from "../tokens";
import { Styles } from "../utils/Styles";
import { Icon, IconMapper } from "./IconMapper";

type CustomIconButtonProps = {
  icon: Icon;
  onClick: () => void;
  disabled: boolean;
  color?: string;
};

export const CustomIconButton = ({
  icon,
  color = tokens.color.accent.dark,
  disabled,
  onClick,
}: CustomIconButtonProps) => {
  return (
    <div
      style={{
        ...styles.wrapper,
        backgroundColor: color,
        ...(disabled ? styles.disabled : undefined),
      }}
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
    >
      <IconMapper icon={icon} />
    </div>
  );
};

const styles: Styles = {
  wrapper: {
    width: 30,
    height: 30,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    cursor: "pointer",
  },
  disabled: {
    backgroundColor: tokens.color.state.disabled,
    cursor: "auto",
  },
};
