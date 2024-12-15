import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useState } from "react";
import { Styles } from "../../../../../utils/Styles";
import { Student } from "../../../../../hooks/Edition/useGroupsSection";
import { tokens } from "../../../../../tokens";

type SelectStudentProps = {
  students: Student[];
  handleAddStudent: (student: Student) => void;
};

export const SelectStudent = ({
  students,
  handleAddStudent,
}: SelectStudentProps) => {
  const [student, setStudent] = useState<undefined | Student>(undefined);

  return (
    <div style={styles.innerContainer}>
      <FormControl fullWidth>
        <InputLabel>Student</InputLabel>
        <Select
          name="studentId"
          value={student?.userId}
          placeholder="choose student"
          onChange={(e) =>
            setStudent(students.find((s) => s.userId === e.target.value))
          }
        >
          {students.map((student) => (
            <MenuItem key={student.userId} value={student.userId}>
              {student.firstName} {student.secondName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <button
        disabled={!student}
        onClick={() => {
          if (student) {
            handleAddStudent(student);
          }
        }}
        type="button"
      >
        add student
      </button>
    </div>
  );
};

const styles: Styles = {
  innerContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    padding: 12,
    width: 500,
  },
  points: {
    width: 80,
  },
  title: {
    fontWeight: "bold",
  },
  error: {
    color: tokens.color.state.error,
  },
};
