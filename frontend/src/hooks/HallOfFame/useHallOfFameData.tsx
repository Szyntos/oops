import { UsersRolesType } from "../../__generated__/schema.graphql.types";
import { HallOfFameStudentData } from "../../components/hallOfFame/HallOfFameStudentCard";
import { useHallOfFameQuery } from "../../graphql/hallOfFame.graphql.types";
import { useEditionSelection } from "../common/useEditionSelection";
import { useUser } from "../common/useUser";

export const useHallOfFameData = () => {
  const { selectedEdition } = useEditionSelection();
  const { user } = useUser();

  const { loading, error, data } = useHallOfFameQuery({
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
      };
    }) ?? [];

  const highlightedStudent = students.find((student) => {
    return student.id === user.userId;
  });

  return {
    isUserRoleStudent: user.role === UsersRolesType.Student,
    students,
    highlightedStudent:
      user.role === UsersRolesType.Student ? highlightedStudent : undefined,
    loading,
    error,
  };
};
