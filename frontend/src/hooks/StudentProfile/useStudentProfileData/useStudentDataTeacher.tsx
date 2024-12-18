import { FilterItem } from "../../../components/Groups/FilterBar/FilterOptionsSection";
import { FilterMenuItemType } from "../../../components/StudentProfile/table/FilterMenu/FilterMenu";
import { useCategoriesQuery } from "../../../graphql/categories.graphql.types";
import { useStudentPointsTeacherQuery } from "../../../graphql/studentPointsTeacher.graphql.types";
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
  projectCheck: boolean;
  levelCheck: boolean;
  override?: boolean;
};

export const useStudentDataTeacher = (props: {
  editionId: string | undefined;
  studentId: string | undefined;
}) => {
  const { editionId, studentId } = props;
  const { data, loading, error, refetch } = useStudentPointsTeacherQuery({
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
        override: Boolean(
          user.userLevels.find((l) => l?.edition.editionId)
            ?.coordinatorOverride,
        ),
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
        levelCheck: Boolean(
          user.userLevels.find((e) => e?.edition.editionId === editionId)
            ?.endOfLabsLevelsReached,
        ),
        projectCheck: Boolean(
          user.userLevels.find((e) => e?.edition.editionId === editionId)
            ?.projectPointsThresholdReached,
        ),
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

  const filterHeaderNames: FilterMenuItemType[] =
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
