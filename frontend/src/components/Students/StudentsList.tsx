import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/common/useUser";
import { pathsGenerator } from "../../router/paths";
import { Styles } from "../../utils/Styles";
import { StudentsListCard } from "./StudentsListCard";
import { Group } from "../../hooks/common/useGroupsData";
import { UsersRolesType } from "../../__generated__/schema.graphql.types";

// TODO name to clean up after group screen is ready
export type StudentFromList = {
  id: string;
  avatarId?: string;
  firstName: string;
  secondName: string;
  group: Group;
  nick: string;
  index: number;
};

type StudentsListProps = {
  students: StudentFromList[];
};

export const StudentsList = ({ students: groups }: StudentsListProps) => {
  const navigate = useNavigate();
  const user = useUser();

  return (
    <div style={styles.studentsContainer}>
      {groups.map((student) => (
        <StudentsListCard
          key={student.id}
          student={student}
          onClick={() =>
            navigate(pathsGenerator.teacher.StudentProfile(student.id))
          }
          withEditableRights={
            student.group.teacher.id === user.user.userId ||
            user.user.role === UsersRolesType.Coordinator
          }
        />
      ))}
    </div>
  );
};

const styles: Styles = {
  studentsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
    margin: 12,
  },
};
