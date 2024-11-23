import { useGroupsQuery } from "../../graphql/groups.graphql.types";

export type Group = {
  name: string;
  id: string;
  weekday: Weekday;
  time: Timestamp;
  teacher: {
    fullName: string;
    id: string;
  };
  imageId?: string;
};

export type Weekday = {
  id: string;
  name: string;
};

export type Timestamp = {
  start: string;
  end: string;
};

export const useGroupsData = (editionId: string | undefined) => {
  const { data, loading, error } = useGroupsQuery({
    variables: {
      editionId: editionId as string,
    },
    skip: !editionId,
  });

  const groups: Group[] =
    data?.editionByPk?.groups.map((group) => {
      return {
        name: group.generatedName,
        id: group.groupsId,
        weekday: {
          id: group.weekday.weekdayId,
          name: group.weekday.weekdayName,
        },
        time: { start: group.startTime, end: group.endTime },
        teacher: {
          fullName: group.teacher.fullName as string,
          id: group.teacher.userId as string,
        },
        imageId: group.file?.fileId,
      };
    }) ?? [];

  return { groups, groupsLoading: loading, groupsError: error };
};
