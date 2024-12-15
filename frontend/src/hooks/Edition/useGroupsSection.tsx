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
import { UsersRolesType } from "../../__generated__/schema.graphql.types";
import { useSetupGroupCsvParseMutation } from "../../graphql/setupGroupCSVParse.graphql.types";
import { useSetupGroupEditMutation } from "../../graphql/setupGroupEdit.graphql.types";
import { useDeleteGroupMutation } from "../../graphql/deleteGroup.graphql.types";
import { useError } from "../common/useGlobalError";
import { UPLOAD_FILES_URL } from "../../utils/constants";
import { useApolloClient } from "@apollo/client";
import { useMarkPassingStudentsInactiveMutation } from "../../graphql/markPassingStudentsInactive.graphql.types";
import { useConfirmPopup } from "../common/useConfirmPopup";
import { UsersQuery, useUsersQuery } from "../../graphql/users.graphql.types";

export type Group = SetupGroupsQuery["listSetupGroups"][number];

// TODO check if those types are ok
export type Teacher = UsersQuery["users"][number];
export type Student = UsersQuery["users"][number];

export const useGroupsSection = (editionId: number) => {
  const { globalErrorWrapper, localErrorWrapper } = useError();
  const client = useApolloClient();

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
    variables: { editionId },
    fetchPolicy: "no-cache",
  });

  const groups: Group[] = data?.listSetupGroups ?? [];

  const {
    weekdays,
    loading: weekdaysLoading,
    error: weekdaysError,
  } = useWeekdayData();

  const {
    data: usersData,
    loading: usersLoading,
    error: UsersError,
  } = useUsersQuery();

  const teachers: Teacher[] =
    usersData?.users.filter(
      (u) =>
        u.role.toLocaleUpperCase() === UsersRolesType.Coordinator ||
        u.role.toLocaleUpperCase() === UsersRolesType.Teacher,
    ) ?? [];
  const students: Student[] =
    usersData?.users.filter(
      (u) => u.role.toLocaleUpperCase() === UsersRolesType.Student && u.active,
    ) ?? [];

  console.log("TEACHERS: ", teachers);
  console.log("STUDENTS: ", students);

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
          endTime: values.endTime,
          startTime: values.startTime,
          teacherId: parseInt(values.teacherId),
          weekdayId: parseInt(values.weekdayId),
          users: selectedStudents.map((s) => {
            return {
              indexNumber: s.indexNumber,
              nick: s.nick,
              firstName: s.firstName,
              secondName: s.secondName,
              role: s.role,
              imageFileId: parseInt(s.imageFileId as string),
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
          groupId: parseInt(selectedGroup?.group.groupsId as string),
          startTime: values.startTime,
          endTime: values.endTime,
          teacherId: parseInt(values.teacherId),
          usosId: values.usosId,
          weekdayId: parseInt(values.weekdayId),
          users: {
            userIds: selectedStudents.map((s) => parseInt(s.userId)) ?? [],
          },
        },
      });
      refetch();
      closeEditDialog();
    });
  };

  // DELETE
  const { openConfirmPopup } = useConfirmPopup();
  const [deleteGroup] = useDeleteGroupMutation();
  const handleDeleteGroup = async (group: Group) => {
    openConfirmPopup(() => {
      globalErrorWrapper(async () => {
        await deleteGroup({
          variables: { groupId: parseInt(group.group.groupsId) },
        });
        refetch();
      });
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
          ...u,
          __typename: "Users",
          firebaseUid: null,
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

  // MARK PASSING STUDENTS AS INACTIVE
  const [markPassingStudentsActive] = useMarkPassingStudentsInactiveMutation();
  const handleMarkAllPassingStudents = () => {
    globalErrorWrapper(async () => {
      await markPassingStudentsActive({
        variables: { editionId },
      });
      client.refetchQueries({
        include: "active",
      });
    });
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

    variant,
    selectedGroup,

    handleMarkAllPassingStudents,
  };
};
