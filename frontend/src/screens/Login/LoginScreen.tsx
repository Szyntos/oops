import { LoginForm, LoginFormValues } from "../../components/Welcome/LoginForm";
import { useState, useEffect } from "react";
import {
  coordinatorStyles,
  formStyles,
  getCardStyles,
} from "../../utils/utils";
import { CustomText } from "../../components/CustomText";
import { tokens } from "../../tokens";
import { useLogin } from "../../hooks/auth/useLogin";
import { useError } from "../../hooks/common/useGlobalError";
import { MD_DIALOG_WIDTH } from "../../components/dialogs/CustomDialog";

const randomMessages = [
  "The cake is a lie.",
  "War. War never changes.",
  "It's dangerous to go alone! Take this.",
  "Do a barrel roll!",
  "Would you kindly?",
  "I used to be an adventurer like you, then I took an arrow to the knee.",
  "You were almost a Jill sandwich!",
  "Finish him!",
  "Praise the sun!",
  "Thank you, Mario! But our princess is in another castle.",
  "Hey! Listen!",
  "You must construct additional pylons.",
  "Get over here!",
  "You died.",
  "Waka waka waka.",
  "Stay awhile and listen.",
  "What is better: to be born good, or to overcome your evil nature through great effort?",
  "Our lives are measured in years, but their deeds are measured in lives saved.",
  "Glory to mankind.",
  "This is my story.",
  "A man chooses, a slave obeys.",
  "Nothing is true, everything is permitted.",
  "Snake? SNAAAAKE!",
  "This is not your grave... but you are welcome in it.",
  "Hadouken!",
  "The right man in the wrong place can make all the difference in the world.",
  "Requiescat in pace.",
  "I am Error.",
  "Rise and shine, Mr. Freeman.",
  "Prepare to die.",
];

export const LoginScreen = () => {
  const [randomText, setRandomText] = useState("");

  useEffect(() => {
    const generateRandomText = () => {
      const randomIndex = Math.floor(Math.random() * randomMessages.length);
      setRandomText(randomMessages[randomIndex]);
    };
    generateRandomText();
  }, [randomMessages]);

  const { loginWithCredentials, resetPassword } = useLogin();
  const { localErrorWrapper } = useError();
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [resetCodeSent, setResetCodeSent] = useState(false);

  const handleLoginClick = (values: LoginFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await loginWithCredentials({
        email: values.email,
        password: values.password,
      });
    });
  };

  const handleResetPassword = (values: LoginFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await resetPassword({ variables: { email: values.email } });
      setResetCodeSent(true);
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
            Zaloguj się{" "}
          </CustomText>
        </div>

        <LoginForm
          handleLoginClick={handleLoginClick}
          handleResetPasswordClick={handleResetPassword}
          formError={formError}
        />

        {resetCodeSent && (
          <CustomText color={tokens.color.text.secondary}>
            Sprawdź swoją skrzynkę, wysłaliśmy do ciebie linka!
          </CustomText>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            marginTop: 20,
          }}
        >
          <CustomText color={tokens.color.text.secondary}>
            {randomText}
          </CustomText>
        </div>
      </div>
    </div>
  );
};
