import { FilterItem } from "../../components/StudentProfile/table/FilterMenu";
import {
  StudentPointsQuery,
  useStudentPointsQuery,
} from "../../graphql/studentPoints.graphql.types";

export type Points = NonNullable<
  StudentPointsQuery["getStudentPoints"]
>["subcategoryPoints"][number];

export type StudentCardData = {
  // TODO add student avatar
  id: string;
  displayName: string;
  index: number;
  level: string;
  group: {
    name: string;
    id: string;
    weekday: string;
    time: {
      start: string;
      end: string;
    };
    teacherDisplayName: string;
  };
  totalPoints: number;
};

export const useStudentData = (props: {
  editionId: string;
  studentId: string;
}) => {
  const { editionId, studentId } = props;

  const {
    data,
    loading: studentPointsLoading,
    error: studentPointsError,
    refetch: studentPointsRefetch,
  } = useStudentPointsQuery({
    variables: {
      editionId: parseInt(editionId),
      studentId: parseInt(studentId),
    },
  });

  const points: Points[] = data?.getStudentPoints.subcategoryPoints ?? [];

  const user = data?.getStudentPoints.user;

  const studentData: StudentCardData | undefined = user
    ? {
        id: user.userId.toString(),
        displayName: `${user.firstName} ${user.secondName}`,
        index: user.indexNumber,
        level: data?.getStudentPoints.level?.levelName ?? "-",
        group: {
          // TODO why still nulls - it was meant to be corrected
          // TODO there should be no useGroups returned, but group which is never null
          name: user.userGroups[0]?.group.groupName ?? "-",
          id: user.userGroups[0]?.group.groupsId ?? "-1",
          weekday: user.userGroups[0]?.group.weekday ?? "-",
          time: {
            start: user.userGroups[0]?.group.startTime ?? "-",
            end: user.userGroups[0]?.group.endTime ?? "-",
          },
          // TODO: why no display name
          teacherDisplayName: `${user.userGroups[0]?.group.teacher?.firstName ?? "-"} ${user.userGroups[0]?.group.teacher?.secondName ?? "-"}`,
        },
        totalPoints: data.getStudentPoints.sumOfAll,
      }
    : undefined;

  const uniqueCategories: Map<string, FilterItem> = new Map();

  points
    .map((p) => {
      return {
        id: p.subcategory.category.categoryId.toString(),
        name: p.subcategory.category.categoryName,
      };
    })
    .forEach((entry) => {
      if (!uniqueCategories.has(entry.id)) {
        uniqueCategories.set(entry.id, entry);
      }
    });

  const filterHeaderNames: FilterItem[] =
    Array.from(uniqueCategories.values()) ?? [];

  return {
    studentData,
    points,
    filterHeaderNames,
    studentPointsLoading,
    studentPointsError,
    studentPointsRefetch,
  };
};