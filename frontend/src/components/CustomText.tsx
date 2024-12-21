import { tokens } from "../tokens";
import { Styles } from "../utils/Styles";

type CustomTextProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
  style?: React.CSSProperties;
  size?: number;
  color?: string;
  bold?: boolean;
  onClick?: () => void;
};

export const CustomText = ({
  children,
  style,
  size = tokens.font.text,
  color = tokens.color.text.primary,
  bold,
  onClick,
}: CustomTextProps) => {
  return (
    <div
      style={{
        ...styles.text,
        fontSize: size,
        color: color,
        fontWeight: bold ? "bold" : undefined,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const styles: Styles = {
  text: {
    // userSelect: "none",
  },
};
