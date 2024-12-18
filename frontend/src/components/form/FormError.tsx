import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";
import { CustomText } from "../CustomText";

type FormErrorProps = {
  error: string | undefined | null;
  isFormError?: boolean;
};

export const FormError = ({ error, isFormError }: FormErrorProps) => {
  return error ? (
    <CustomText
      style={{
        ...styles.error,
        ...(isFormError ? styles.formError : undefined),
      }}
    >
      {error}
    </CustomText>
  ) : (
    <></>
  );
};

const styles: Styles = {
  error: {
    color: tokens.color.state.error,
    fontSize: 13,
    paddingLeft: 12,
    paddingTop: 4,
    paddingBottom: 6,
  },
  formError: {
    color: tokens.color.state.error,
    fontSize: tokens.font.text,
    paddingLeft: 4,
    padding: 0,
    paddingTop: 12,
    fontWeight: "bold",
  },
};
