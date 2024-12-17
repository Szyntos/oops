import { ReactNode } from "react";
import { Styles } from "../../utils/Styles";
import { NAV_BAR_HEIGHT_WITH_BORDER } from "./Navbar/Navbar";
import { EDITION_NAVBAR_HEIGHT } from "../Edition/EditionScreenNavbar";

type ScreenContentContainerProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export const CONTENT_CONTAINER_HEIGHT_CALC = `calc(100vh - ${NAV_BAR_HEIGHT_WITH_BORDER}px)`;
export const EDITION_CONTENT_CONTAINER_HEIGHT_CALC = `calc(100vh - ${NAV_BAR_HEIGHT_WITH_BORDER + EDITION_NAVBAR_HEIGHT + 24}px)`;

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
    minHeight: CONTENT_CONTAINER_HEIGHT_CALC,
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 12,
  },
};
