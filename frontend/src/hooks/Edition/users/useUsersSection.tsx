import { useState } from "react";
import { UsersRolesType } from "../../../__generated__/schema.graphql.types";
import {
  SetupUsersQuery,
  useSetupUsersQuery,
} from "../../../graphql/setupUsers.graphql.types";
import { useSetupStudentCreateMutation } from "../../../graphql/setupStudentCreate.graphql.types";
import { StudentFormValues } from "../../../components/Edition/Sections/UsersSection/StudentAddForm";
import { useSetupTeacherCreateMutation } from "../../../graphql/setupTeacherCreate.graphql.types";
import { TeacherFormValues } from "../../../components/Edition/Sections/UsersSection/TeacherAddForm";
import { useSEtupUserEditMutation } from "../../../graphql/setupUserEdit.graphql.types";
import { useDeleteUserMutation } from "../../../graphql/deleteUser.graphql.types";

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

  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

  // STUDENT ----------------------------------------------------
  const [isAddStudentOpen, setIsAddOpen] = useState(false);
  const openAddStudent = () => {
    setIsAddOpen(true);
  };
  const closeAddStudent = () => {
    setFormError(undefined);
    setIsAddOpen(false);
  };

  const [createStudent] = useSetupStudentCreateMutation();
  const handleAddStudentConfirm = async (values: StudentFormValues) => {
    errorWrapper(async () => {
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
    });
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

  // TEACHER --------------------------------------------------
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const openAddTeacher = () => {
    setIsAddTeacherOpen(true);
  };
  const closeAddTeacher = () => {
    setFormError(undefined);
    setIsAddTeacherOpen(false);
  };

  const [createTeacher] = useSetupTeacherCreateMutation();
  const handleAddTeacherConfirm = async (values: TeacherFormValues) => {
    errorWrapper(async () => {
      await createTeacher({
        variables: {
          firstName: values.firstName,
          secondName: values.secondName,
          email: values.email,
        },
      });
      refetch();
      closeAddTeacher();
    });
  };

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

  // COMMON -------------------------------------------------
  const [editUser] = useSEtupUserEditMutation();
  const handleEditUserConfirm = async (
    props:
      | { type: "student"; formValues: StudentFormValues }
      | { type: "teacher"; formValues: TeacherFormValues },
  ) => {
    errorWrapper(async () => {
      const variables = {
        userId: parseInt(selectedUser?.userId as string),
        firstName: props.formValues.firstName,
        secondName: props.formValues.secondName,
      };

      await editUser({
        variables:
          props.type == "teacher"
            ? variables
            : {
                ...variables,
                nick: props.formValues.nick,
                indexNumber: props.formValues.indexNumber,
              },
      });

      refetch();
      props.type === "student" ? closeEditStudent() : closeEditTeacher();
    });
  };

  const [deleteUser] = useDeleteUserMutation();
  const handleDeleteConfirm = async (u: User) => {
    try {
      await deleteUser({
        variables: { userId: parseInt(u.userId) },
      });
      refetch();
    } catch (error) {
      console.error(error);
      // TODO global error
    }
  };

  const errorWrapper = (foo: () => void) => {
    try {
      foo();
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
    handleEditStudentConfirm: (values: StudentFormValues) => {
      handleEditUserConfirm({
        type: "student",
        formValues: values,
      });
    },
    // TEACHER
    isAddTeacherOpen,
    openAddTeacher,
    closeAddTeacher,
    handleAddTeacherConfirm,
    isEditTeacherOpen,
    closeEditTeacher,
    openEditTeacher,
    handleEditTeacherConfirm: (values: TeacherFormValues) => {
      handleEditUserConfirm({
        type: "teacher",
        formValues: values,
      });
    },
  };
};
