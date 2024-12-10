import { StudentFromList } from "../../components/Students/StudentsList";
import { useStudentsQuery } from "../../graphql/students.graphql.types";

export const useStudentsData = (editionId: string | undefined) => {
  const {
    data: studentsData,
    loading,
    error,
  } = useStudentsQuery({
    variables: { editionId: editionId as string },
    skip: !editionId,
  });

  const students: StudentFromList[] =
    studentsData?.users.map((item) => {
      const student = item.userGroups[0].user;
      const group = item.userGroups[0].group;
      const teacher = group.teacher;
      return {
        id: student.userId,
        avatarId: student.imageFileId ?? undefined,
        firstName: student.firstName,
        secondName: student.secondName,
        nick: student.nick,
        index: student.indexNumber,
        group: {
          name: group.generatedName,
          id: group.groupsId,
          weekday: {
            id: group.weekday.weekdayId,
            name: group.weekday.weekdayName,
          },
          time: {
            start: group.startTime,
            end: group.endTime,
          },
          teacher: {
            fullName: teacher.fullName as string,
            id: teacher.userId as string,
          },
        },
      };
    }) ?? [];

  return { students, studentsLoading: loading, studentsError: error };
};
