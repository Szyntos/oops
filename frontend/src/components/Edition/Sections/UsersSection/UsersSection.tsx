import { Dialog } from "@mui/material";
import {
  User,
  useUsersSection,
} from "../../../../hooks/Edition/users/useUsersSection";
import { Styles } from "../../../../utils/Styles";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { AddStudentForm } from "./StudentAddForm";
import { UsersList } from "./UsersList/UsersList";
import { AddTeacherForm } from "./TeacherAddForm";
import { useParams } from "react-router-dom";
import { StudentsListSearcher } from "../../../Students/StudentsListSearcher";
import { useState } from "react";
import { RadioFilterGroups } from "../../../Groups/RadioFilterGroup";
import { isPartOfAString } from "../../../../utils/strings";

const activeRadioOptions = [
  { id: "active", name: "active" },
  { id: "inactive", name: "inactive" },
];

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
    handleStudentActiveness,
  } = useUsersSection(editionId);

  const [input, setInput] = useState("");
  const [showActiveUsers, setShowActiveUsers] = useState(true);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  const doesFilterMatch = (user: User) => {
    const matchActiveState = showActiveUsers
      ? user.user.active === true
      : user.user.active === false;
    const matchInput =
      input === "undefined" ||
      input === "" ||
      isPartOfAString(input, [
        `${user.user.firstName} ${user.user.secondName}`,
      ]);
    return matchActiveState && matchInput;
  };

  const displayTeachers = teachers.filter((teacher) =>
    doesFilterMatch(teacher),
  );

  const displayStudents = students.filter((student) =>
    doesFilterMatch(student),
  );

  return (
    <div>
      <div style={styles.buttonsContainer}>
        <button onClick={openAddStudent}>add student</button>
        <button onClick={openAddTeacher}>add teacher</button>
      </div>
      <div>
        <div style={styles.topBar}>
          <StudentsListSearcher
            onInputChange={(input: string) => setInput(input)}
          />
          <RadioFilterGroups
            options={activeRadioOptions}
            onOptionChange={(option) =>
              setShowActiveUsers(option.id === "active")
            }
            selectedOption={activeRadioOptions[showActiveUsers ? 0 : 1]}
          />
        </div>

        <UsersList
          users={displayTeachers}
          title="TEACHERS"
          handleDeleteClick={handleDeleteConfirm}
          handleEditClick={openEditTeacher}
        />
        <UsersList
          users={displayStudents}
          title="STUDENTS"
          handleDeleteClick={handleDeleteConfirm}
          handleEditClick={openEditStudent}
          handleStudentActiveness={handleStudentActiveness}
        />
      </div>

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
  topBar: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
