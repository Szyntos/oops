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
  color = "blue",
  disabled,
  onClick,
}: CustomIconButtonProps) => {
  return (
    <div
      style={{
        ...styles.wrapper,
        backgroundColor: color ?? "pink",
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
    backgroundColor: "grey",
    cursor: "auto",
  },
};
