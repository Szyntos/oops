import { Outlet } from "react-router-dom";
import { Styles } from "../utils/Styles";
import { tokens } from "../tokens";
import { Navbar } from "./layout/Navbar/Navbar";

export const Root = () => {
  return (
    <div style={styles.screenContainer}>
      <Navbar />
      <Outlet />
    </div>
  );
};

const styles: Styles = {
  screenContainer: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: tokens.color.background.primary,
    display: "flex",
    flexDirection: "column",
  },
};
