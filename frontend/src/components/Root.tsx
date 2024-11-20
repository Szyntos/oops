import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Styles } from "../utils/Styles";
import { ChestsToOpenQuery } from "../graphql/chestsToOpen.graphql.types";

export type Chest =
  ChestsToOpenQuery["users"][number]["chestHistories"][number];

export const Root = () => {
  return (
    <div style={styles.screenContainer}>
      <Navbar />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

const styles: Styles = {
  screenContainer: {
    width: "100%",
    minHeight: "100vh",
  },
};
