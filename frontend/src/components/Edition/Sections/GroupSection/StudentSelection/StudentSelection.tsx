import { Student } from "../../../../../hooks/Edition/useGroupsSection";
import { SelectedStudentsList } from "./SelectedStudentsList";
import { SelectStudent } from "./SelectStudent";

type StudentSelectionProps = {
  students: Student[];
  selectedStudents: Student[];
  handleAdd: (student: Student) => void;
  handleDelete: (student: Student) => void;
};

export const StudentSelection = ({
  students,
  selectedStudents,
  handleAdd,
  handleDelete,
}: StudentSelectionProps) => {
  return (
    <>
      <div>Selected Students:</div>
      <SelectedStudentsList
        students={selectedStudents}
        handleDelete={handleDelete}
      />
      <SelectStudent students={students} handleAddStudent={handleAdd} />
    </>
  );
};
