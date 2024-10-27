import { Dialog } from "@mui/material";
import { useUsersSection } from "../../../../hooks/Edition/useUsersSection";
import { Styles } from "../../../../utils/Styles";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { AddStudentForm } from "./StudentAddForm";
import { UsersList } from "./UsersList/UsersList";
import { AddTeacherForm } from "./TeacherAddForm";

type UsersSectionProps = {
  editionId: number;
};

export const UsersSection = ({ editionId }: UsersSectionProps) => {
  const {
    teachers,
    students,
    loading,
    error,
    isAddStudentOpen,
    closeAddStudent,
    openAddStudent,
    handleAddStudent,
    isAddTeacherOpen,
    closeAddTeacher,
    openAddTeacher,
    handleAddTeacher,
    formError,
  } = useUsersSection();

  // TODO to delete
  console.log("editionId: ", editionId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div>
      <div style={styles.buttonsContainer}>
        <button onClick={openAddStudent}>add student</button>
        <button onClick={openAddTeacher}>add teacher</button>
      </div>
      <UsersList users={teachers} title="TEACHERS" />
      <UsersList users={students} title="STUDENTS" />

      <Dialog open={isAddStudentOpen}>
        <CloseHeader onCloseClick={closeAddStudent} />
        <AddStudentForm
          createError={formError}
          handleAddStudent={handleAddStudent}
        />
      </Dialog>

      <Dialog open={isAddTeacherOpen}>
        <CloseHeader onCloseClick={closeAddTeacher} />
        <AddTeacherForm
          createError={formError}
          handleAddTeacher={handleAddTeacher}
        />
      </Dialog>
    </div>
  );
};

const styles: Styles = {
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
