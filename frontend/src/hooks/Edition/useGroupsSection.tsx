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
import { useDeleteGroupMutation } from "../../graphql/deleteGroup.graphql.types";
import { useError } from "../common/useGlobalError";
import { UPLOAD_FILES_URL } from "../../utils/constants";

export type Group = NonNullable<
  SetupGroupsQuery["editionByPk"]
>["groups"][number];

export type Teacher = SetupUsersQuery["users"][number];
export type Student = SetupUsersQuery["users"][number];

export const useGroupsSection = (editionId: number) => {
  const { globalErrorWrapper, localErrorWrapper } = useError();

  const [formError, setFormError] = useState<string | undefined>(undefined);

  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const openAddGroup = (v: AddGroupVariant) => {
    setIsAddGroupOpen(true);
    setVariant(v);
  };
  const closeAddGroup = () => {
    setFormError(undefined);
    setIsAddGroupOpen(false);
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

  // ADD
  const [createGroup] = useSetupGroupCreateMutation();
  const handleAddGroup = async (
    values: GroupFormValues,
    selectedStudents: Student[],
  ) => {
    localErrorWrapper(setFormError, async () => {
      await createGroup({
        variables: {
          editionId,
          usosId: values.usosId,
          endTime: values.endTime + ":00",
          startTime: values.startTime + ":00",
          teacherId: parseInt(values.teacherId),
          weekdayId: parseInt(values.weekdayId),
          users: selectedStudents.map((s) => {
            return {
              indexNumber: s.indexNumber,
              nick: s.nick,
              firstName: s.firstName,
              secondName: s.secondName,
              role: s.role,
              imageFileId: s.imageFileId ? Number(s.imageFileId) : undefined,
              // TODO: change to true on production
              createFirebaseUser: false,
              email: s.email,
              label: "",
              sendEmail: false,
            };
          }),
        },
      });
      refetch();
      closeAddGroup();
    });
  };

  // EDIT
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
    undefined,
  );
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setIsEditGroupOpen(true);
  };
  const closeEditDialog = () => {
    setSelectedGroup(undefined);
    setIsEditGroupOpen(false);
  };
  const [variant, setVariant] = useState<AddGroupVariant>("import");

  const [editGroup] = useSetupGroupEditMutation();
  const handleEditGroupConfirm = async (
    values: GroupFormValues,
    selectedStudents: Student[],
  ) => {
    localErrorWrapper(setFormError, async () => {
      await editGroup({
        variables: {
          groupId: parseInt(selectedGroup?.groupsId ?? "-1"),
          startTime: values.startTime,
          endTime: values.endTime,
          teacherId: parseInt(values.teacherId),
          usosId: values.usosId,
          weekdayId: parseInt(values.weekdayId),
          userIds: selectedStudents.map((s) => parseInt(s.userId)) ?? [],
        },
      });
      refetch();
      closeEditDialog();
    });
  };

  // DELETE
  const [deleteGroup] = useDeleteGroupMutation();
  const handleDeleteGroup = async (group: Group) => {
    globalErrorWrapper(async () => {
      await deleteGroup({ variables: { groupId: parseInt(group.groupsId) } });
      refetch();
    });
  };

  // IMPORT
  // TODO to another hook
  const [parseCSV] = useSetupGroupCsvParseMutation();
  const handleUploadStudents = async (
    editionId: number,
    formData: FormData,
  ): Promise<Student[]> => {
    // TODO maybe global error wrapper with return ?
    try {
      // upload file
      const res = await fetch(UPLOAD_FILES_URL, {
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

  // GROUP CHANGE
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
    formError,

    isAddGroupOpen,
    openAddGroup,
    closeAddGroup,
    handleAddGroup,

    isEditGroupOpen,
    openEditDialog,
    closeEditDialog,
    handleEditGroupConfirm,
    handleDeleteGroup,

    handleUploadStudents,
    handleStudentGroupChange,

    variant,
    selectedGroup,
  };
};
