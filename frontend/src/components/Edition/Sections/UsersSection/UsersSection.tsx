import { Dialog } from "@mui/material";
import {
  User,
  useUsersSection,
} from "../../../../hooks/Edition/useUsersSection";
import { Styles } from "../../../../utils/Styles";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { AddStudentForm } from "./StudentAddForm";
import { UsersList } from "./UsersList/UsersList";
import { AddTeacherForm } from "./TeacherAddForm";

export const UsersSection = () => {
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
    isEditStudentOpen,
    openEditStudent,
    closeEditStudent,
    isEditTeacherOpen,
    openEditTeacher,
    closeEditTeacher,
    handleEditStudentConfirm,
    handleEditTeacherConfirm,
    selectedUser,
  } = useUsersSection();

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  const handleDeleteClick = (u: User) => {
    console.log("hejka ", u);
  };
  return (
    <div>
      <div style={styles.buttonsContainer}>
        <button onClick={openAddStudent}>add student</button>
        <button onClick={openAddTeacher}>add teacher</button>
      </div>
      <UsersList
        users={teachers}
        title="TEACHERS"
        handleDeleteClick={handleDeleteClick}
        handleEditClick={openEditTeacher}
      />
      <UsersList
        users={students}
        title="STUDENTS"
        handleDeleteClick={handleDeleteClick}
        handleEditClick={openEditStudent}
      />

      <Dialog open={isAddStudentOpen}>
        <CloseHeader onCloseClick={closeAddStudent} />
        <AddStudentForm
          createError={formError}
          handleConfirm={handleAddStudent}
        />
      </Dialog>

      <Dialog open={isAddTeacherOpen}>
        <CloseHeader onCloseClick={closeAddTeacher} />
        <AddTeacherForm
          createError={formError}
          handleConfirm={handleAddTeacher}
        />
      </Dialog>

      <Dialog open={isEditStudentOpen}>
        <CloseHeader onCloseClick={closeEditStudent} />
        <AddStudentForm
          createError={formError}
          handleConfirm={handleEditStudentConfirm}
          initialValues={selectedUser ? selectedUser : undefined}
        />
      </Dialog>

      <Dialog open={isEditTeacherOpen}>
        <CloseHeader onCloseClick={closeEditTeacher} />
        <AddTeacherForm
          createError={formError}
          handleConfirm={handleEditTeacherConfirm}
          initialValues={selectedUser ? selectedUser : undefined}
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
