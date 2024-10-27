import { useState } from "react";
import {
  SetupGroupsQuery,
  useSetupGroupsQuery,
} from "../../graphql/setupGroups.graphql.types";
import { useWeekdayData } from "../Groups/FilterBar/useWeekdaysData";
import { GroupFormValues } from "../../components/Edition/Sections/GroupSection/GroupAddForm";
import {
  SetupTeachersQuery,
  useSetupTeachersQuery,
} from "../../graphql/setupTeachers.graphql.types";
import { useSetupGroupCreateMutation } from "../../graphql/setupGroupCreate.graphql.types";

export type Group = NonNullable<
  SetupGroupsQuery["editionByPk"]
>["groups"][number];

export type Teacher = SetupTeachersQuery["users"][number];

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
    data: teachersData,
    loading: teachersLoading,
    error: teacherError,
  } = useSetupTeachersQuery();

  const teachers: Teacher[] = teachersData?.users ?? [];

  const [createGroup] = useSetupGroupCreateMutation();

  const handleAddGroup = async (values: GroupFormValues) => {
    try {
      await createGroup({
        variables: {
          editionId,
          startTime: values.startTime,
          endTime: values.endTime,
          teacherId: parseInt(values.teacherId),
          usosId: values.usosId,
          weekdayId: parseInt(values.weekdayId),
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
    loading: loading || weekdaysLoading || teachersLoading,
    error: error || weekdaysError || teacherError,
    handleAddGroup,
    openAddDialog,
    isAddDialogOpen,
    closeAddDialog,
    formError,
  };
};
