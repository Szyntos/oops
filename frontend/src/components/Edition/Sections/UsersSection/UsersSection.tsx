import { Dialog } from "@mui/material";
import { useUsersSection } from "../../../../hooks/Edition/users/useUsersSection";
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
    formError,
    selectedUser,
    handleDeleteConfirm,
    // STUDENT
    isAddStudentOpen,
    openAddStudent,
    closeAddStudent,
    handleAddStudentConfirm,
    isEditStudentOpen,
    closeEditStudent,
    openEditStudent,
    handleEditStudentConfirm,
    // TEACHER
    isAddTeacherOpen,
    openAddTeacher,
    closeAddTeacher,
    handleAddTeacherConfirm,
    isEditTeacherOpen,
    closeEditTeacher,
    openEditTeacher,
    handleEditTeacherConfirm,
  } = useUsersSection();

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div>
      <div style={styles.buttonsContainer}>
        <button onClick={openAddStudent}>add student</button>
        <button onClick={openAddTeacher}>add teacher</button>
      </div>
      <UsersList
        users={teachers}
        title="TEACHERS"
        handleDeleteClick={handleDeleteConfirm}
        handleEditClick={openEditTeacher}
      />
      <UsersList
        users={students}
        title="STUDENTS"
        handleDeleteClick={handleDeleteConfirm}
        handleEditClick={openEditStudent}
      />

      <Dialog open={isAddStudentOpen}>
        <CloseHeader onCloseClick={closeAddStudent} />
        <AddStudentForm
          createError={formError}
          handleConfirm={handleAddStudentConfirm}
          title={"Add student"}
        />
      </Dialog>

      <Dialog open={isEditStudentOpen}>
        <CloseHeader onCloseClick={closeEditStudent} />
        <AddStudentForm
          createError={formError}
          handleConfirm={handleEditStudentConfirm}
          initialValues={selectedUser ? selectedUser : undefined}
          title={"Edit student"}
        />
      </Dialog>

      <Dialog open={isEditTeacherOpen}>
        <CloseHeader onCloseClick={closeEditTeacher} />
        <AddTeacherForm
          createError={formError}
          handleConfirm={handleEditTeacherConfirm}
          initialValues={selectedUser ? selectedUser : undefined}
          title={"Add teacher"}
        />
      </Dialog>

      <Dialog open={isAddTeacherOpen}>
        <CloseHeader onCloseClick={closeAddTeacher} />
        <AddTeacherForm
          createError={formError}
          handleConfirm={handleAddTeacherConfirm}
          title={"Edit teacher"}
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
