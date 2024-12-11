import { ReactNode } from "react";
import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";

type CustomSideBarProps = {
  children: ReactNode;
  minWidth?: number;
  maxWidth?: number;
};

export const CustomSideBar = ({
  children,
  minWidth = 360,
  maxWidth = 400,
}: CustomSideBarProps) => {
  return (
    <div style={{ ...styles.container, minWidth, maxWidth }}>{children}</div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    padding: 16,
    gap: 24,
    backgroundColor: tokens.color.card.navy,
  },
};
