import { Student } from "../../../../../hooks/Edition/useGroupsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { StudentRow } from "./StudentRow";

type SelectedStudentsProps = {
  students: Student[];
  handleDelete: (student: Student) => void;
};

export const SelectedStudentsList = ({
  students,
  handleDelete,
}: SelectedStudentsProps) => {
  return (
    <div>
      {students.length > 0
        ? students.map((s) => (
            <StudentRow student={s} handleDelete={handleDelete} />
          ))
        : EMPTY_FIELD_STRING}
    </div>
  );
};
