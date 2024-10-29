import { useState } from "react";
import { UsersRolesType } from "../../__generated__/schema.graphql.types";
import {
  SetupUsersQuery,
  useSetupUsersQuery,
} from "../../graphql/setupUsers.graphql.types";
import { useSetupStudentCreateMutation } from "../../graphql/setupStudentCreate.graphql.types";
import { StudentFormValues } from "../../components/Edition/Sections/UsersSection/StudentAddForm";
import { useSetupTeacherCreateMutation } from "../../graphql/setupTeacherCreate.graphql.types";
import { TeacherFormValues } from "../../components/Edition/Sections/UsersSection/TeacherAddForm";
import { useSEtupUserEditMutation } from "../../graphql/setupUserEdit.graphql.types";

export type User = SetupUsersQuery["users"][number];

export const useUsersSection = () => {
  const { data, loading, error, refetch } = useSetupUsersQuery();
  const [formError, setFormError] = useState<undefined | string>(undefined);

  const teachers: User[] =
    data?.users.filter(
      (u) => u.role.toUpperCase() === UsersRolesType.Teacher,
    ) ?? [];
  const students: User[] =
    data?.users.filter(
      (u) => u.role.toUpperCase() === UsersRolesType.Student,
    ) ?? [];

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const openAddStudent = () => {
    setIsAddStudentOpen(true);
  };
  const closeAddStudent = () => {
    setFormError(undefined);
    setIsAddStudentOpen(false);
  };

  const [createStudent] = useSetupStudentCreateMutation();

  const handleAddStudent = async (values: StudentFormValues) => {
    try {
      await createStudent({
        variables: {
          firstName: values.firstName,
          secondName: values.secondName,
          indexNumber: values.indexNumber,
          nick: values.nick,
        },
      });
      refetch();
      closeAddStudent();
    } catch (error) {
      console.error(error);
      setFormError(
        error instanceof Error ? error.message : "Unexpected error received.",
      );
    }
  };

  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const openAddTeacher = () => {
    setIsAddTeacherOpen(true);
  };
  const closeAddTeacher = () => {
    setFormError(undefined);
    setIsAddTeacherOpen(false);
  };

  const [createTeacher] = useSetupTeacherCreateMutation();

  const handleAddTeacher = async (values: TeacherFormValues) => {
    try {
      await createTeacher({
        variables: {
          firstName: values.firstName,
          secondName: values.secondName,
          email: values.email,
        },
      });
      refetch();
      closeAddTeacher();
    } catch (error) {
      console.error(error);
      setFormError(
        error instanceof Error ? error.message : "Unexpected error received.",
      );
    }
  };

  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const openEditTeacher = (user: User) => {
    setSelectedUser(user);
    setIsEditTeacherOpen(true);
  };
  const closeEditTeacher = () => {
    setSelectedUser(undefined);
    setIsEditTeacherOpen(false);
    setFormError(undefined);
  };

  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const openEditStudent = (user: User) => {
    setSelectedUser(user);
    setIsEditStudentOpen(true);
  };
  const closeEditStudent = () => {
    setSelectedUser(undefined);
    setIsEditStudentOpen(false);
    setFormError(undefined);
  };

  const [editUser] = useSEtupUserEditMutation();

  const handleEditClick = async (
    user: User,
    data:
      | { type: "student"; data: StudentFormValues }
      | { type: "teacher"; data: TeacherFormValues },
  ) => {
    const variables = {
      userId: parseInt(user.userId),
      firstName: data.data.firstName,
      secondName: data.data.secondName,
    };

    try {
      await editUser({
        variables:
          data.type == "teacher"
            ? variables
            : {
                ...variables,
                nick: data.data.nick,
                indexNumber: data.data.indexNumber,
              },
      });
      refetch();

      if (data.type === "student") {
        closeEditStudent();
      } else {
        closeEditTeacher();
      }
    } catch (error) {
      console.error(error);
      setFormError(
        error instanceof Error ? error.message : "Unexpected error received.",
      );
    }
  };

  return {
    teachers,
    students,
    loading,
    error,
    handleAddStudent,
    handleAddTeacher,
    isAddStudentOpen,
    openAddStudent,
    closeAddStudent,
    isAddTeacherOpen,
    openAddTeacher,
    closeAddTeacher,
    formError,
    isEditStudentOpen,
    closeEditStudent,
    openEditStudent,
    isEditTeacherOpen,
    closeEditTeacher,
    openEditTeacher,
    handleEditStudentConfirm: (values: StudentFormValues) => {
      handleEditClick(selectedUser as User, { type: "student", data: values });
    },
    handleEditTeacherConfirm: (values: TeacherFormValues) => {
      handleEditClick(selectedUser as User, { type: "teacher", data: values });
    },
    selectedUser,
  };
};
