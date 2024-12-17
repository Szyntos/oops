import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";
import { CustomText } from "../CustomText";

type NotEditableInfoProps = {
  hasEditableRights: boolean;
  isSelectedEditionActive: boolean;
  type: "student" | "group";
};

export const NotEditableInfo = ({
  hasEditableRights,
  isSelectedEditionActive,
  type,
}: NotEditableInfoProps) => {
  return (
    <div style={styles.card}>
      <CustomText color={tokens.color.state.error} bold={true}>
        Nie możesz zarządzać punktami{" "}
        {type === "student" ? "tego studenta" : "tej grupy"}, bo:
      </CustomText>
      <div style={styles.reasonsContainer}>
        {!hasEditableRights && (
          <CustomText>
            - nie jesteś prowadzącym{" "}
            {type === "student" ? "jego grupy" : "tej grupy"}
          </CustomText>
        )}
        {!isSelectedEditionActive && (
          <CustomText>- wybrana edycja nie jest aktywna</CustomText>
        )}
      </div>
    </div>
  );
};

const styles: Styles = {
  card: {
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    borderRadius: 4,
    border: `2px solid ${tokens.color.state.error}`,
  },
  reasonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
};
