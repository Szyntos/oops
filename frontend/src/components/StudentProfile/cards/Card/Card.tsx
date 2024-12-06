import { ReactNode } from "react";
import { Styles } from "../../../../utils/Styles";
import { tokens } from "../../../../tokens";

type CardProps = {
  children: ReactNode;
};
export const Card = ({ children }: CardProps) => {
  return <div style={{ ...styles.card, ...styles.container }}>{children}</div>;
};

const styles: Styles = {
  card: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: tokens.color.text.secondary,
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};
