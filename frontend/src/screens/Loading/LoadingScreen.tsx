import { CircularProgress } from "@mui/material";
import { Styles } from "../../utils/Styles";
import {
  CONTENT_CONTAINER_HEIGHT_CALC,
  EDITION_CONTENT_CONTAINER_HEIGHT_CALC,
} from "../../components/layout/ScreenContentContainer";

type LoadingScreenProps = {
  type?: "default" | "edition";
};
export const LoadingScreen = ({ type = "default" }: LoadingScreenProps) => {
  return (
    <div
      style={{
        ...styles.container,
        height:
          type === "default"
            ? CONTENT_CONTAINER_HEIGHT_CALC
            : EDITION_CONTENT_CONTAINER_HEIGHT_CALC,
      }}
    >
      <CircularProgress color="secondary" />
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
};
