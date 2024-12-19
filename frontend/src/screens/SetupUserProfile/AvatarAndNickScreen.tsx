import { useSetStudentNickMutation } from "../../graphql/setStudentNick.graphql.types.ts";
import { useUser } from "../../hooks/common/useUser.ts";
import { useSetStudentAvatarMutation } from "../../graphql/setStudentAvatar.graphql.types.ts";
import { useFilesQuery } from "../../graphql/files.graphql.types.ts";
import { useConfirmPopup } from "../../hooks/common/useConfirmPopup.ts";
import { useNavigate } from "react-router-dom";
import { pathsGenerator } from "../../router/paths.tsx";
import {
  coordinatorStyles,
  formStyles,
  getCardStyles,
} from "../../utils/utils.ts";
import { LoadingScreen } from "../Loading/LoadingScreen.tsx";
import { ErrorScreen } from "../Error/ErrorScreen.tsx";
import { MD_DIALOG_WIDTH } from "../../components/dialogs/CustomDialog.tsx";
import { z } from "zod";
import { SetupUserForm, SetupUserFormValues } from "./SetupUserForm.tsx";
import { useError } from "../../hooks/common/useGlobalError.tsx";
import { useState } from "react";
import { CustomText } from "../../components/CustomText.tsx";
import { tokens } from "../../tokens.tsx";

export type AvatarAndNickValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  nick: z.string().min(1, "Nick is required"),
  avatarId: z.string().min(1, "Avatar is required"),
});

export const AvatarAndNickScreen = () => {
  const { user } = useUser();
  const [setStudentNick] = useSetStudentNickMutation();
  const [setStudentAvatar] = useSetStudentAvatarMutation();
  const { openConfirmPopup } = useConfirmPopup();
  const navigate = useNavigate();
  const { localErrorWrapper } = useError();

  const [formError, setFormError] = useState<string | undefined>(undefined);

  const {
    data: imageData,
    loading: imageLoading,
    error: imageError,
  } = useFilesQuery({ variables: { paths: ["image/user"] } });

  const imageIds: string[] =
    imageData?.getFilesGroupedByTypeBySelectedTypes[0].files.map(
      (f) => f.file.fileId,
    ) ?? [];

  const handleConfirmClick = (values: SetupUserFormValues) => {
    openConfirmPopup(() => {
      localErrorWrapper(setFormError, async () => {
        await setStudentNick({
          variables: { nick: values.nick, userId: parseInt(user.userId) },
        });
        await setStudentAvatar({
          variables: {
            fileId: parseInt(values.avatarId),
            userId: parseInt(user.userId),
          },
        });
        navigate(pathsGenerator.student.StudentProfile);
      });
    });
  };

  if (imageLoading) return <LoadingScreen />;
  if (imageError) return <ErrorScreen />;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        margin: 20,
      }}
    >
      <div
        style={{
          width: MD_DIALOG_WIDTH,
          ...getCardStyles(false),
          padding: 20,
        }}
      >
        <div
          style={{
            ...coordinatorStyles.textContainer,
            gap: 8,
            paddingBottom: 12,
          }}
        >
          <CustomText style={formStyles.title} size={tokens.font.header}>
            Utwórz profil{" "}
          </CustomText>
        </div>

        <SetupUserForm
          handleSubmit={handleConfirmClick}
          imageIds={imageIds}
          formError={formError}
        />
      </div>
    </div>
  );
};
