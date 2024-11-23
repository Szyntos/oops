import { Styles } from "../../utils/Styles";
import { useStudentsScreenData } from "../../hooks/Students/useStudentsScreenData";
import { useState } from "react";
import { useSetStudentNickMutation } from "../../graphql/setStudentNick.graphql.types";
import { useUser } from "../../hooks/common/useUser";
//import { SelectImage } from "../../components/inputs/SelectImage";

export const AvatarAndNickScreen = () => {
  const [nick, setNick] = useState("");
  const [loginError, setNickError] = useState("");
  const { user } = useUser();
  const [setStudentNick] = useSetStudentNickMutation();
  const setUserNick = async (userNick: string, userId: number) => {
    const { errors } = await setStudentNick({
      variables: {
        nick: userNick,
        userId: userId,
      },
    });

    if (errors) {
      throw new Error(errors[0]?.message ?? "Error setting a.");
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

  const { loading, error } = useStudentsScreenData();

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error?.message}</div>;

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

        {loginError && <p className="error">{loginError}</p>}
        <button type="submit">Login</button>
      </form>

      {/* <SelectImage
            type="withoutTooltip"
            options={imageIds}
            selectedIds={[formik.values.fileId.toString()]}
            onSelectClick={(updatedIds: string[]) =>
              formik.setValues({
                ...formik.values,
                fileId: updatedIds.length > 0 ? updatedIds[0] : "",
              })
            }
            error={formik.errors.fileId as string}
            touched={formik.touched.fileId}
            selectVariant={"single"}
            title="select image:"
          /> */}
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
