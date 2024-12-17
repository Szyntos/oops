import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";
import { CustomText } from "../CustomText";
import { HooverWrapper } from "../HooverWrapper";

export const FormButton = () => {
  return (
    <div style={styles.wrapper}>
      <HooverWrapper>
        <button type="submit" style={styles.button}>
          <CustomText>Potwierdź</CustomText>
        </button>
      </HooverWrapper>
    </div>
  );
};

const styles: Styles = {
  wrapper: {
    display: "flex",
    justifyContent: "right",
  },
  button: {
    backgroundColor: tokens.color.accent.dark,
    padding: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 6,
    cursor: "pointer",
    display: "inline-block",
    userSelect: "none",
    border: "none",
    marginRight: 10,
    marginBottom: 10,
  },
};
