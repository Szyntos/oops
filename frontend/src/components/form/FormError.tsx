import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";
import { CustomText } from "../CustomText";

type FormErrorProps = {
  error: string | undefined | null;
};

export const FormError = ({ error }: FormErrorProps) => {
  return error ? <CustomText style={styles.error}>{error}</CustomText> : <></>;
};

const styles: Styles = {
  error: {
    color: tokens.color.state.error,
    fontSize: 13,
    paddingLeft: 12,
    paddingTop: 4,
    paddingBottom: 12,
  },
};
