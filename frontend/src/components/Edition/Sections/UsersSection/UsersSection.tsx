import {
  User,
  useUsersSection,
} from "../../../../hooks/Edition/users/useUsersSection";
import { Styles } from "../../../../utils/Styles";
import { AddStudentForm } from "./StudentAddForm";
import { UsersList } from "./UsersList/UsersList";
import { AddTeacherForm } from "./TeacherAddForm";
import { useParams } from "react-router-dom";
import { StudentsListSearcher } from "../../../Students/StudentsListSearcher";
import { useState } from "react";
import { RadioFilterGroups } from "../../../Groups/RadioFilterGroup";
import { isPartOfAString } from "../../../../utils/strings";
import { LoadingScreen } from "../../../../screens/Loading/LoadingScreen";
import { ErrorScreen } from "../../../../screens/Error/ErrorScreen";
import { CustomButton } from "../../../CustomButton";
import { coordinatorStyles } from "../../../../utils/utils";
import { CustomDialog } from "../../../dialogs/CustomDialog";

const activeRadioOptions = [
  { id: "active", name: "Aktywny" },
  { id: "inactive", name: "Nieaktywny" },
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

  if (loading) return <LoadingScreen type="edition" />;
  if (error) return <ErrorScreen type="edition" />;

  const doesFilterMatch = (user: User) => {
    const matchActiveState = showActiveUsers
      ? user.user.active === true
      : user.user.active === false;
    const matchInput =
      input === "undefined" ||
      input === "" ||
      isPartOfAString(input, [
        `${user.user.firstName} ${user.user.secondName}`,
        user.user.nick,
        user.user.indexNumber.toString(),
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
    <div style={coordinatorStyles.container}>
      <div style={styles.topBar}>
        <div style={coordinatorStyles.buttonsContainer}>
          <CustomButton onClick={openAddStudent}>Dodaj studenta</CustomButton>
          <CustomButton onClick={openAddTeacher}>
            Dodaj prowadzącego
          </CustomButton>
        </div>
        <StudentsListSearcher
          onInputChange={(input: string) => setInput(input)}
          placeholder="Wyszukaj uyżytkownika"
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
        title="Prowadzący"
        handleDeleteClick={handleDeleteConfirm}
        handleEditClick={openEditTeacher}
      />
      <UsersList
        users={displayStudents}
        title="Studenci"
        handleDeleteClick={handleDeleteConfirm}
        handleEditClick={openEditStudent}
        handleStudentActiveness={handleStudentActiveness}
      />

      <CustomDialog
        isOpen={isAddStudentOpen}
        onCloseClick={closeAddStudent}
        title="Dodaj studenta"
      >
        <AddStudentForm
          formError={formError}
          handleConfirm={handleAddStudentConfirm}
        />
      </CustomDialog>

      <CustomDialog
        isOpen={isEditStudentOpen}
        onCloseClick={closeEditStudent}
        title="Edytuj studenta"
      >
        <AddStudentForm
          formError={formError}
          handleConfirm={handleEditStudentConfirm}
          initialValues={selectedUser?.user}
        />
      </CustomDialog>

      <CustomDialog
        isOpen={isAddTeacherOpen}
        onCloseClick={closeAddTeacher}
        title="Dodaj prowadzącego"
      >
        <AddTeacherForm
          formError={formError}
          handleConfirm={handleEditTeacherConfirm}
          initialValues={selectedUser?.user}
        />
      </CustomDialog>

      <CustomDialog
        isOpen={isEditTeacherOpen}
        onCloseClick={closeEditTeacher}
        title="Edytuj prowadzącego"
      >
        <AddTeacherForm
          formError={formError}
          handleConfirm={handleAddTeacherConfirm}
        />
      </CustomDialog>
    </div>
  );
};

const styles: Styles = {
  topBar: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
