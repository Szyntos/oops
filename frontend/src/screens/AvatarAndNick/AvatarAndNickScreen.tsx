import { Styles } from "../../utils/Styles";
import { useStudentsScreenData } from "../../hooks/Students/useStudentsScreenData";
import { useState } from "react";
import { useSetStudentNickMutation } from "../../graphql/setStudentNick.graphql.types";
import { useUser } from "../../hooks/common/useUser";
import { useSetStudentAvatarMutation } from "../../graphql/setStudentAvatar.graphql.types";
import { useFilesQuery } from "../../graphql/files.graphql.types";
import { SelectImage } from "../../components/inputs/SelectImage";
import { useConfirmPopup } from "../../hooks/common/useConfirmPopup";
import { ConfirmAvatarNickPopupDialog } from "../../components/dialogs/ConfirmAvatarNickPopupDialog.tsx/ConfirmAvatarNickPopupDialog.tsx";
import { useNavigate } from "react-router-dom";
import { pathsGenerator } from "../../router/paths";
import TextField from "@mui/material/TextField";

export const AvatarAndNickScreen = () => {
  const [nick, setNick] = useState("");
  const [nickError, setNickError] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const { user } = useUser();
  const [setStudentNick] = useSetStudentNickMutation();
  const [setStudentAvatar] = useSetStudentAvatarMutation();
  const { openConfirmPopup } = useConfirmPopup();
  const navigate = useNavigate();

  const setUserNick = async (userNick: string, userId: number) => {
    const { errors } = await setStudentNick({
      variables: {
        nick: userNick,
        userId: userId,
      },
    });

    if (errors) {
      throw new Error(errors[0]?.message ?? "Error setting a nick.");
    }
  };

  const setUserAvatar = async (userId: number, fileId: number) => {
    const { errors } = await setStudentAvatar({
      variables: {
        fileId: fileId,
        userId: userId,
      },
    });

    if (errors) {
      throw new Error(errors[0]?.message ?? "Error setting avatar.");
    }
  };

  const handleConfirmClick = () => {
    openConfirmPopup(async () => {
      try {
        if (nick) await setUserNick(nick, parseInt(user.userId));
        if (selectedAvatar)
          await setUserAvatar(parseInt(user.userId), parseInt(selectedAvatar));
        setNickError("");

        navigate(pathsGenerator.student.StudentProfile);
      } catch (error) {
        console.error("ERROR: ", error);
        setNickError((error as Error).message);
      }
    });
  };

  const {
    data: imageData,
    loading: imageLoading,
    error: imageError,
  } = useFilesQuery({ variables: { paths: ["image/user"] } });
  const { loading, error } = useStudentsScreenData();

  if (imageLoading) return <div>Loading...</div>;
  if (imageError) return <div>ERROR: {imageError.message}</div>;

  if (loading) return <div>Loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.container}>
      <form>
        <TextField
          label="Nick"
          variant="outlined"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          error={!!nickError}
          helperText={nickError}
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "black",
              },
              "&:hover fieldset": {
                borderColor: "black",
              },
              "&.Mui-focused fieldset": {
                borderColor: "black",
              },
            },
            "& .MuiInputBase-input": {
              color: "black",
            },
            "& .MuiFormLabel-root": {
              color: "black",
            },
          }}
        />
      </form>

      <SelectImage
        type="withoutTooltip"
        options={
          imageData?.getFilesGroupedByTypeBySelectedTypes.flatMap((e) =>
            e.files.map((e2) => e2.file.fileId),
          ) ?? []
        }
        selectedIds={selectedAvatar ? [selectedAvatar] : []}
        onSelectClick={(updatedIds: string[]) =>
          setSelectedAvatar(updatedIds[0] ?? null)
        }
        // TODO why empty
        error={undefined}
        touched={undefined}
        selectVariant={"single"}
        title="Select Image:"
      />

      <button onClick={handleConfirmClick}>Confirm</button>

      <ConfirmAvatarNickPopupDialog />
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    margin: 12,
  },
};
