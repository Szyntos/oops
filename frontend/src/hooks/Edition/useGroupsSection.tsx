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

export type Group = NonNullable<
  SetupGroupsQuery["editionByPk"]
>["groups"][number];

export type Teacher = SetupTeachersQuery["users"][number];

export const useGroupsSection = (editionId: number) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };
  const closeAddDialog = () => {
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

  const handleAddGroup = (values: GroupFormValues) => {
    console.log("values: ", values);
  };

  return {
    groups,
    weekdays,
    teachers,
    loading: loading || weekdaysLoading || teachersLoading,
    error: error || weekdaysError || teacherError,
    refetch,
    handleAddGroup,
    openAddDialog,
    isAddDialogOpen,
    closeAddDialog,
  };
};
