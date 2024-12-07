import { FilterItem } from "../../../components/Groups/FilterBar/FilterOptionsSection";
import { FilterMenuItemm } from "../../../components/StudentProfile/table/FilterMenu/FilterMenu";
import { useCategoriesQuery } from "../../../graphql/categories.graphql.types";
import { useStudentPointsQuery } from "../../../graphql/studentPoints.graphql.types";
import { Timestamp, Weekday } from "../../common/useGroupsData";
import { Points } from "../types";

export type StudentCardData = {
  id: string;
  nick: string;
  displayName: string;
  index: number;
  group?: {
    name: string;
    id: string;
    weekday: Weekday;
    time: Timestamp;
    teacherDisplayName: string;
    teacherId: string;
  };
  totalPoints: number;
  avatarId: string | undefined;
  grade: string;
};

export const useStudentData = (props: {
  editionId: string | undefined;
  studentId: string | undefined;
}) => {
  const { editionId, studentId } = props;
  const { data, loading, error, refetch } = useStudentPointsQuery({
    variables: {
      editionId: parseInt(editionId as string),
      studentId: parseInt(studentId as string),
    },
    skip: !editionId || !studentId,
  });

  const points: Points[] = data?.getStudentPoints.subcategoryPoints ?? [];

  const user = data?.getStudentPoints.user;

  const studentData: StudentCardData | undefined = user
    ? {
        nick: user.nick,
        id: user.userId.toString(),
        displayName: `${user.firstName} ${user.secondName}`,
        index: user.indexNumber,
        grade:
          user.userLevels
            .find((l) => l?.edition.editionId)
            ?.computedGrade.toFixed(1)
            .toString() ?? "",
        group: user.userGroups[0]
          ? {
              name: user.userGroups[0].group.generatedName,
              id: user.userGroups[0].group.groupsId,
              weekday: {
                id: user.userGroups[0].group.weekday.weekdayId,
                name: user.userGroups[0].group.weekday.weekdayName,
              },
              time: {
                start: user.userGroups[0].group.startTime,
                end: user.userGroups[0].group.endTime,
              },
              teacherDisplayName: `${user.userGroups[0].group.teacher?.firstName ?? "-"} ${user.userGroups[0].group.teacher?.secondName ?? "-"}`,
              teacherId: user.userGroups[0].group.teacher.userId,
            }
          : undefined,
        totalPoints: data.getStudentPoints.sumOfAll,
        avatarId: user.imageFile?.fileId,
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

  const {
    data: headersData,
    loading: headersLoading,
    error: headersError,
  } = useCategoriesQuery({ variables: { editionId: editionId as string } });

  const filterHeaderNames: FilterMenuItemm[] =
    headersData?.categories.map((c) => ({
      ...c,
      id: c.categoryId,
      name: c.categoryName,
    })) ?? [];

  return {
    studentData,
    points,
    filterHeaderNames,
    studentPointsLoading: loading || headersLoading,
    studentPointsError: error || headersError,
    studentPointsRefetch: refetch,
  };
};
