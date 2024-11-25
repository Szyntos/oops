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
import { useError } from "../../common/useGlobalError";
import { useConfirmPopup } from "../../common/useConfrimPopup";

export type User = SetupUsersQuery["listSetupUsers"][number];

export const useUsersSection = (editionId: number) => {
  const { localErrorWrapper, globalErrorWrapper } = useError();

  const { data, loading, error, refetch } = useSetupUsersQuery({
    variables: { editionId },
    fetchPolicy: "no-cache",
  });
  const [formError, setFormError] = useState<undefined | string>(undefined);

  const teachers: User[] =
    data?.listSetupUsers.filter(
      (u) => u.user.role.toUpperCase() === UsersRolesType.Teacher,
    ) ?? [];
  const students: User[] =
    data?.listSetupUsers.filter(
      (u) => u.user.role.toUpperCase() === UsersRolesType.Student,
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
  const handleAddStudentConfirm = (values: StudentFormValues) => {
    localErrorWrapper(setFormError, async () => {
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
  const handleAddTeacherConfirm = (values: TeacherFormValues) => {
    localErrorWrapper(setFormError, async () => {
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
  const handleEditUserConfirm = (
    props:
      | { type: "student"; formValues: StudentFormValues }
      | { type: "teacher"; formValues: TeacherFormValues },
  ) => {
    localErrorWrapper(setFormError, async () => {
      const variables = {
        userId: parseInt(selectedUser?.user.userId as string),
        firstName: props.formValues.firstName,
        secondName: props.formValues.secondName,
      };

      await editUser({
        variables:
          props.type === "teacher"
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

  const { openConfirmPopup } = useConfirmPopup();
  const [deleteUser] = useDeleteUserMutation();
  const handleDeleteConfirm = (u: User) => {
    openConfirmPopup(() => {
      globalErrorWrapper(async () => {
        await deleteUser({
          variables: { userId: parseInt(u.user.userId) },
        });
        refetch();
      });
    });
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
