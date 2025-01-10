import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";
import { CustomText } from "../CustomText";
import { HooverWrapper } from "../HooverWrapper";

type FormButtonProps = {
  onClick?: () => void;
  title?: string;
};

export const FormButton = ({
  onClick,
  title = "Potwierdź",
}: FormButtonProps) => {
  return (
    <div style={styles.wrapper}>
      <HooverWrapper>
        <button type="submit" style={styles.button} onClick={() => onClick?.()}>
          <CustomText>{title}</CustomText>
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
    backgroundColor: tokens.color.accent.light,
    padding: 12,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 6,
    cursor: "pointer",
    display: "inline-block",
    userSelect: "none",
    border: "none",
    margin: 12,
  },
};
