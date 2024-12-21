import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";
import { CustomText } from "../../components/CustomText";
import {
  CONTENT_CONTAINER_HEIGHT_CALC,
  EDITION_CONTENT_CONTAINER_HEIGHT_CALC,
} from "../../components/layout/ScreenContentContainer";

type ErrorScreenProps = {
  message?: string;
  type?: "default" | "edition";
};

export const ErrorScreen = ({
  message,
  type = "default",
}: ErrorScreenProps) => {
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
      <CustomText
        size={tokens.font.header}
        bold={true}
        color={tokens.color.text.primary}
      >
        oops :(
      </CustomText>
      <CustomText>
        {message ? message : "Coś poszło nie tak, spróbuj ponownie później..."}
      </CustomText>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
};
