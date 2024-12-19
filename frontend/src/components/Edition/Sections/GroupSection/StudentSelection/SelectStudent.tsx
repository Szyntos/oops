import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useState } from "react";
import { Styles } from "../../../../../utils/Styles";
import { Student } from "../../../../../hooks/Edition/useGroupsSection";
import { RowButton } from "../../CategoriesSection/AddCategoryForm/RowButton";

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
    <div style={styles.row}>
      <FormControl fullWidth>
        <InputLabel>Student</InputLabel>
        <Select
          size="small"
          name="studentId"
          value={student?.userId}
          placeholder="Wybierz studenta"
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

      <RowButton
        isDisabled={!student}
        onClick={() => {
          if (student) {
            handleAddStudent(student);
          }
        }}
        icon="add"
      />
    </div>
  );
};

const styles: Styles = {
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
  },
};
