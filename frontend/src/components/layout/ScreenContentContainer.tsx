import { ReactNode } from "react";
import { Styles } from "../../utils/Styles";
import { NAV_BAR_HEIGHT } from "./Navbar/Navbar";

type ScreenContentContainerProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export const CONTENT_CONTAINER_HEIGHT = `calc(100vh - ${NAV_BAR_HEIGHT + 1}px)`;

export const ScreenContentContainer = ({
  sidebar,
  children,
}: ScreenContentContainerProps) => {
  return (
    <div style={styles.container}>
      {sidebar}
      <div style={styles.contentContainer}>{children}</div>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    minHeight: CONTENT_CONTAINER_HEIGHT,
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 12,
  },
};
