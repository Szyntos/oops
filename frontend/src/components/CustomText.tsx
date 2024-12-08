import { tokens } from "../tokens";
import { Styles } from "../utils/Styles";

type CustomTextProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: any;
  style?: React.CSSProperties;
  size?: number;
  color?: string;
  bold?: boolean;
};

export const CustomText = ({
  children,
  style,
  size,
  color,
  bold,
}: CustomTextProps) => {
  return (
    <div
      style={{
        ...styles.text,
        fontSize: size ?? tokens.font.text,
        color: color ?? tokens.color.text.primary,
        fontWeight: bold ? "bold" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const styles: Styles = {
  text: {
    userSelect: "none",
  },
};
