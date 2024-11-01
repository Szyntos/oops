import { Student } from "../../../../../hooks/Edition/useGroupsSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { StudentRow } from "./StudentRow";

type SelectedStudentsProps = {
  students: Student[];
  handleDelete: (student: Student) => void;
  title: string;
};

export const SelectedStudentsList = ({
  students,
  handleDelete,
  title,
}: SelectedStudentsProps) => {
  return (
    <div>
      <div>{title}</div>
      <div>
        {students.length > 0
          ? students.map((s) => (
              <StudentRow student={s} handleDelete={handleDelete} />
            ))
          : EMPTY_FIELD_STRING}
      </div>
    </div>
  );
};
