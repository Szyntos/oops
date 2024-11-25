import { Styles } from "../../utils/Styles";
import { useStudentsScreenData } from "../../hooks/Students/useStudentsScreenData";
import { useState } from "react";
import { useSetStudentNickMutation } from "../../graphql/setStudentNick.graphql.types";
import { useUser } from "../../hooks/common/useUser";
import { useSetStudentAvatarMutation } from "../../graphql/setStudentAvatar.graphql.types";
import { useFilesQuery } from "../../graphql/files.graphql.types";
import { SelectImage } from "../../components/inputs/SelectImage";

export const AvatarAndNickScreen = () => {
  const [nick, setNick] = useState("");
  const [nickError, setNickError] = useState("");
  const { user } = useUser();
  const [setStudentNick] = useSetStudentNickMutation();
  const [setStudentAvatar] = useSetStudentAvatarMutation();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await setUserNick(nick, parseInt(user.userId));
      setNickError("");
    } catch (error) {
      console.error("ERROR: ", error);
      setNickError((error as Error).message);
    }
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
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nick:</label>
          <input
            type="text"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            required
          />
        </div>

        {nickError && <p className="error">{nickError}</p>}
        <button type="submit">Set Nick</button>
      </form>

      <SelectImage
        type="avatar"
        options={
          imageData?.getFilesGroupedByTypeBySelectedTypes.flatMap((e) =>
            e.files.map((e2) => e2.file.fileId),
          ) ?? []
        }
        selectedIds={[]}
        onSelectClick={(updatedIds: string[]) =>
          setUserAvatar(parseInt(user.userId), parseInt(updatedIds[0]))
        }
        error={undefined}
        touched={undefined}
        selectVariant={"single"}
        title="Select Image:"
      />
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    gap: 20,
    margin: 12,
  },
  rightSide: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  topBar: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
