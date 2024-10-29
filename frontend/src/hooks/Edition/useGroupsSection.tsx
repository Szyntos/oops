import { useState } from "react";
import {
  SetupGroupsQuery,
  useSetupGroupsQuery,
} from "../../graphql/setupGroups.graphql.types";
import { useWeekdayData } from "../Groups/FilterBar/useWeekdaysData";
import {
  AddGroupVariant,
  GroupFormValues,
} from "../../components/Edition/Sections/GroupSection/GroupAddForm";
import { useSetupGroupCreateMutation } from "../../graphql/setupGroupCreate.graphql.types";
import {
  SetupUsersQuery,
  useSetupUsersQuery,
} from "../../graphql/setupUsers.graphql.types";
import { UsersRolesType } from "../../__generated__/schema.graphql.types";
import { useSetupGroupCsvParseMutation } from "../../graphql/setupGroupCSVParse.graphql.types";
import { useSetupGroupEditMutation } from "../../graphql/setupGroupEdit.graphql.types";

export type Group = NonNullable<
  SetupGroupsQuery["editionByPk"]
>["groups"][number];

export type Teacher = SetupUsersQuery["users"][number];
export type Student = SetupUsersQuery["users"][number];

export const useGroupsSection = (editionId: number) => {
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const openAddDialog = (v: AddGroupVariant) => {
    setIsAddDialogOpen(true);
    setVariant(v);
  };
  const closeAddDialog = () => {
    setFormError(undefined);
    setIsAddDialogOpen(false);
  };

  const { data, loading, error, refetch } = useSetupGroupsQuery({
    variables: { editionId: editionId.toString() },
  });

  const groups: Group[] = data?.editionByPk?.groups ?? [];

  const {
    weekdays,
    loading: weekdaysLoading,
    error: weekdaysError,
  } = useWeekdayData();

  const {
    data: usersData,
    loading: usersLoading,
    error: UsersError,
  } = useSetupUsersQuery();

  // TODO can be reused form users section hook
  const teachers: Teacher[] =
    usersData?.users.filter(
      (u) =>
        u.role.toLocaleUpperCase() === UsersRolesType.Coordinator ||
        u.role.toLocaleUpperCase() === UsersRolesType.Teacher,
    ) ?? [];

  const students: Student[] =
    usersData?.users.filter(
      (u) => u.role.toLocaleUpperCase() === UsersRolesType.Student,
    ) ?? [];

  const [createGroup] = useSetupGroupCreateMutation();

  const handleAddGroup = async (
    values: GroupFormValues,
    selectedStudents: Student[],
  ) => {
    try {
      await createGroup({
        variables: {
          editionId,
          startTime: values.startTime,
          endTime: values.endTime,
          teacherId: parseInt(values.teacherId),
          usosId: values.usosId,
          weekdayId: parseInt(values.weekdayId),
          users: selectedStudents.map((s) => {
            return {
              createFirebaseUser: false,
              email: `${s.indexNumber}@student.agh.edu.pl`,
              firstName: s.firstName,
              indexNumber: s.indexNumber,
              label: "",
              nick: s.nick,
              role: s.role,
              secondName: s.secondName,
              sendEmail: false,
            };
          }),
        },
      });
      refetch();
      closeAddDialog();
    } catch (error) {
      console.error(error);
      setFormError(
        error instanceof Error ? error.message : "Unexpected error received.",
      );
    }
  };

  const [parseCSV] = useSetupGroupCsvParseMutation();

  const handleUploadStudents = async (
    editionId: number,
    formData: FormData,
  ): Promise<Student[]> => {
    try {
      // upload file
      const res = await fetch("http://localhost:9090/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Error: ${res.statusText}`);

      const r = await res.json();
      const fileId = r.fileId;

      const parseRes = await parseCSV({
        variables: { editionId, fileId },
      });

      const uploadedStudents: Student[] =
        parseRes.data?.parseUsersFromCsv.users.map((u) => ({
          __typename: "Users",
          firstName: u.firstName,
          imageFileId: "",
          fullName: `${u.firstName} ${u.secondName}`,
          indexNumber: u.indexNumber,
          nick: u.nick,
          role: u.role,
          secondName: u.secondName,
          userId: u.userId,
          email: u.email,
        })) ?? [];

      return uploadedStudents;
    } catch (error) {
      console.error("Failed to upload file", error);
      setFormError(
        error instanceof Error ? error.message : "Failed to upload file.",
      );
      return [];
    }
  };

  const [variant, setVariant] = useState<"import" | "select">("import");

  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
    undefined,
  );

  const [isEditOpen, setIsEditOpen] = useState(false);
  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setIsEditOpen(true);
  };
  const closeEditDialog = () => {
    setSelectedGroup(undefined);
    setIsEditOpen(false);
  };

  const [editGroup] = useSetupGroupEditMutation();

  const handleUpdateConfirmation = async (
    values: GroupFormValues,
    selectedStudents: Student[],
  ) => {
    try {
      await editGroup({
        variables: {
          groupId: parseInt(selectedGroup?.groupsId ?? "-1"),
          startTime: values.startTime,
          endTime: values.endTime,
          teacherId: parseInt(values.teacherId),
          usosId: values.usosId,
          weekdayId: parseInt(values.weekdayId),
          // users: selectedStudents.map((s) => {
          //   return {
          //     createFirebaseUser: false,
          //     email: `${s.indexNumber}@student.agh.edu.pl`,
          //     firstName: s.firstName,
          //     indexNumber: s.indexNumber,
          //     label: "",
          //     nick: s.nick,
          //     role: s.role,
          //     secondName: s.secondName,
          //     sendEmail: false,
          //   };
          // }),
        },
      });
      console.log("SELECTED STUDENTS: ", selectedStudents);
      refetch();
      closeEditDialog();
    } catch (error) {
      console.error(error);
      setFormError(
        error instanceof Error ? error.message : "Unexpected error received.",
      );
    }
  };

  const handleStudentGroupChange = (
    userId: string,
    groupId: string | undefined,
  ) => {
    console.log(userId);
    console.log(groupId);
    // TODO change user group
  };

  return {
    groups,
    weekdays,
    teachers,
    students,
    loading: loading || weekdaysLoading || usersLoading,
    error: error || weekdaysError || UsersError,
    handleAddGroup,
    openAddDialog,
    isAddDialogOpen,
    closeAddDialog,
    formError,
    handleUploadStudents,
    variant,
    isEditOpen,
    openEditDialog,
    closeEditDialog,
    handleUpdateConfirmation,
    handleStudentGroupChange,
    selectedGroup,
  };
};
