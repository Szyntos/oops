import { useState } from "react";
import {
  coordinatorStyles,
  formStyles,
  getCardStyles,
} from "../../utils/utils";
import { CustomText } from "../CustomText";
import { tokens } from "../../tokens";
import { useError } from "../../hooks/common/useGlobalError";
import { MD_DIALOG_WIDTH } from "../dialogs/CustomDialog";
import { ResetFormValues, ResetPasswordForm } from "./ResetPasswordForm";
import { useSearchParams } from "react-router-dom";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../../firebaseConfig";

export const ResetPasswordScreen = () => {
  const { localErrorWrapper } = useError();
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const handleResetPassword = (values: ResetFormValues) => {
    localErrorWrapper(setFormError, async () => {
      if (!oobCode) {
        throw new Error("Invalid or missing reset code.");
      }
      await confirmPasswordReset(auth, oobCode, values.password);
      alert("Password has been successfully reset!");
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: 20,
      }}
    >
      <div
        style={{ ...getCardStyles(false), width: MD_DIALOG_WIDTH, padding: 20 }}
      >
        <div
          style={{
            ...coordinatorStyles.textContainer,
            gap: 8,
            paddingBottom: 12,
          }}
        >
          <CustomText style={formStyles.title} size={tokens.font.header}>
            Zmień hasło
          </CustomText>

          <ResetPasswordForm
            handleConfirmClick={handleResetPassword}
            formError={formError}
          />
        </div>
      </div>
    </div>
  );
};
