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
  };
};
