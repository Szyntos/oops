import { UsersRolesType } from "../../__generated__/schema.graphql.types";
import { HallOfFameStudentData } from "../../components/hallOfFame/HallOfFameStudentCard";
import { useHallOfFameQuery } from "../../graphql/hallOfFame.graphql.types";
import { useEditionSelection } from "../common/useEditionSelection";
import { useUser } from "../common/useUser";
import { useLevelsData } from "../StudentProfile";

export const useHallOfFameData = () => {
  const { selectedEdition } = useEditionSelection();
  const { user } = useUser();

  const { loading, error, data } = useHallOfFameQuery({
    variables: { editionId: selectedEdition?.editionId },
    skip: !selectedEdition,
  });

  const {
    levels,
    loading: levelsLoading,
    error: levelsError,
  } = useLevelsData();

  // TODO backend - missing avatarId and animalId (photos)
  // it is a view so there is no way to avoid nulls
  // TODO maybe it shouldn't be view
  const students: HallOfFameStudentData[] =
    data?.hallOfFame.map((student, index) => {
      return {
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

  console.log(groupedStudents);

  return {
    isUserRoleStudent: user.role === UsersRolesType.Student,
    students,
    highlightedStudent:
      user.role === UsersRolesType.Student ? highlightedStudent : undefined,
    groupedStudents, // Return grouped students
    loading: loading || levelsLoading,
    error: error || levelsError,
    levels,
  };
};
