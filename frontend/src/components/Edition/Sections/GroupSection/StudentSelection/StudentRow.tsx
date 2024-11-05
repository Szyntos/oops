import { Student } from "../../../../../hooks/Edition/useGroupsSection";
import { Styles } from "../../../../../utils/Styles";

type StudentRowProps = {
  student: Student;
  handleDelete: (student: Student) => void;
};

export const StudentRow = ({ student, handleDelete }: StudentRowProps) => {
  return (
    <div style={styles.container}>
      <button onClick={() => handleDelete(student)}>-</button>
      <div>{student.fullName}</div>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
