import { useState } from "react";
import {
  SetupGroupsQuery,
  useSetupGroupsQuery,
} from "../../graphql/setupGroups.graphql.types";
import { useWeekdayData } from "../Groups/FilterBar/useWeekdaysData";
import { GroupFormValues } from "../../components/Edition/Sections/GroupSection/GroupAddForm";
import { useSetupGroupCreateMutation } from "../../graphql/setupGroupCreate.graphql.types";
import {
  SetupUsersQuery,
  useSetupUsersQuery,
} from "../../graphql/setupUsers.graphql.types";
import { UsersRolesType } from "../../__generated__/schema.graphql.types";

export type Group = NonNullable<
  SetupGroupsQuery["editionByPk"]
>["groups"][number];

export type Teacher = SetupUsersQuery["users"][number];
export type Student = SetupUsersQuery["users"][number];

export const useGroupsSection = (editionId: number) => {
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const openAddDialog = () => {
    setIsAddDialogOpen(true);
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
  };
};
