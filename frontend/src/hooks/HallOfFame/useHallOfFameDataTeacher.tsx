import { UsersRolesType } from "../../__generated__/schema.graphql.types";
import { HallOfFameStudentData } from "../../components/hallOfFame/HallOfFameStudentCard";
import { useHallOfFameTeacherQuery } from "../../graphql/hallOfFameTeacher.graphql.types";
import { useEditionSelection } from "../common/useEditionSelection";
import { useUser } from "../common/useUser";

export const useHallOfFameDataTeacher = () => {
  const { selectedEdition } = useEditionSelection();
  const { user } = useUser();

  const { loading, error, data } = useHallOfFameTeacherQuery({
    variables: { editionId: selectedEdition?.editionId },
    skip: !selectedEdition,
  });

  // TODO backend - missing avatarId and animalId (photos)
  // it is a view so there is no way to avoid nulls
  // TODO maybe it shouldn't be view
  const students: HallOfFameStudentData[] =
    data?.hallOfFame.map((student, index) => {
      return {
        displayName: `${student.firstName} ${student.secondName}`,
        position: index + 1,
        id: student.userId ?? "",
        nick: student.nick ?? "",
        levelName: student.levelName ?? "",
        totalPoints: student?.sumOfPoints
          ? parseFloat(student?.sumOfPoints)
          : -1,
        groupId: student.groupsId ?? "",
        avatarImgId: student.userImageId ?? undefined,
        levelImgId: student.levelImageId ?? undefined,
        teacherId: student.teacherId ?? undefined,
        groupName: student.generatedName ?? "",
      };
    }) ?? [];

  const groupedStudents: Record<string, HallOfFameStudentData[]> = {};

  for (const student of students) {
    if (student.groupId) {
      if (!groupedStudents[student.groupId]) {
        groupedStudents[student.groupId] = [];
      }
      groupedStudents[student.groupId].push(student);
    }
  }

  const highlightedStudent = students.find((student) => {
    return student.id === user.userId;
  });

  return {
    isUserRoleStudent: user.role === UsersRolesType.Student,
    students,
    highlightedStudent:
      user.role === UsersRolesType.Student ? highlightedStudent : undefined,
    loading: loading,
    error: error,
    groupedStudents,
  };
};
