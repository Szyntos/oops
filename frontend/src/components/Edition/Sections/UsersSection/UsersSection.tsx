import { Dialog } from "@mui/material";
import { useUsersSection } from "../../../../hooks/Edition/users/useUsersSection";
import { Styles } from "../../../../utils/Styles";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { AddStudentForm } from "./StudentAddForm";
import { UsersList } from "./UsersList/UsersList";
import { AddTeacherForm } from "./TeacherAddForm";
import { useParams } from "react-router-dom";

export const UsersSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

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
  } = useUsersSection(editionId);

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
          formError={formError}
          handleConfirm={handleAddStudentConfirm}
          title={"Add student"}
        />
      </Dialog>

      <Dialog open={isEditStudentOpen}>
        <CloseHeader onCloseClick={closeEditStudent} />
        <AddStudentForm
          formError={formError}
          handleConfirm={handleEditStudentConfirm}
          initialValues={selectedUser?.user}
          title={"Edit student"}
        />
      </Dialog>

      <Dialog open={isEditTeacherOpen}>
        <CloseHeader onCloseClick={closeEditTeacher} />
        <AddTeacherForm
          formError={formError}
          handleConfirm={handleEditTeacherConfirm}
          initialValues={selectedUser?.user}
          title={"Add teacher"}
        />
      </Dialog>

      <Dialog open={isAddTeacherOpen}>
        <CloseHeader onCloseClick={closeAddTeacher} />
        <AddTeacherForm
          formError={formError}
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
