import { useState } from "react";
import { Subcategory } from "../../utils/utils";
import { useFormCategories } from "../common/useFormCategories";
import { useCreatePointsMutation } from "../../graphql/createPoints.graphql.types";
import { FormPoints } from "../../components/StudentProfile/PointsForm/types";
import { useError } from "../common/useGlobalError";
import { useAddPointsToGroupMutation } from "../../graphql/addPointsToSubcategory.graphql.types";
import { PointsRowData } from "../../components/Group/PointsRow";
import { Student, useGroupTableData } from "./useGroupTableData";

export type SubcategoryPointsFormData = {
  subcategory: Subcategory;
  rows: PointsRowData[];
};

export const useGroupScreenData = (
  groupId: number | undefined,
  teacherId: string,
) => {
  const { rows, categories, tableLoading, tableError, tableRefetch } =
    useGroupTableData(groupId);

  const {
    addChestCategories,
    loading: formDataLoading,
    error: formDataError,
  } = useFormCategories();

  const { localErrorWrapper } = useError();
  const [formError, setFormError] = useState<string | undefined>(undefined);

  // ADD POINTS TO STUDENT
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>(
    undefined,
  );

  const [isStudentOpen, setIsStudentOpen] = useState<boolean>(false);
  const openStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentOpen(true);
  };
  const closeStudent = () => {
    setSelectedStudent(undefined);
    setFormError(undefined);
    setIsStudentOpen(false);
  };

  const [createPoints] = useCreatePointsMutation();
  const handleAddPointsConfirmation = async (formPoints: FormPoints) => {
    localErrorWrapper(setFormError, async () => {
      await createPoints({
        variables: {
          studentId: parseInt(selectedStudent?.id ?? "-1"),
          subcategoryId: parseInt(formPoints.subcategoryId),
          teacherId: parseInt(teacherId),
          value: formPoints.points,
        },
      });
      closeStudent();
      tableRefetch();
    });
  };

  // ADD POINTS TO SUBCATEGORY
  const [selectedSubcategory, setSelectedSubcategory] = useState<
    SubcategoryPointsFormData | undefined
  >(undefined);

  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState<boolean>(false);
  const openSubcategory = (subcategory: Subcategory) => {
    const subcategoryPoints: SubcategoryPointsFormData = {
      subcategory,
      rows: rows.map((e) => {
        return {
          student: e.student,
          points: e.subcategories.find(
            (s) => s.subcategoryId === subcategory.id,
          )?.pure,
        };
      }),
    };
    setSelectedSubcategory(subcategoryPoints);
    setIsSubcategoryOpen(true);
  };
  const closeSubcategory = () => {
    setSelectedSubcategory(undefined);
    setFormError(undefined);
    setIsSubcategoryOpen(false);
  };

  const [addPointsToGroup] = useAddPointsToGroupMutation();
  const handleAddPointsToGroup = async (rows: PointsRowData[]) => {
    localErrorWrapper(setFormError, async () => {
      await addPointsToGroup({
        variables: {
          groupId: groupId as number,
          subcategoryId: parseInt(
            selectedSubcategory?.subcategory.id as string,
          ),
          teacherId: parseInt(teacherId),
          values: rows.map((e) => ({
            studentId: parseInt(e.student.id),
            value: e.points ?? null,
          })),
        },
      });
      closeSubcategory();
      tableRefetch();
    });
  };

  return {
    rows,
    categories,
    loading: tableLoading || formDataLoading,
    error: tableError || formDataError,

    selectedStudent,
    formError,
    isStudentOpen,
    openStudent,
    closeStudent,

    addChestCategories,
    handleAddPointsConfirmation,

    handleAddPointsToGroup,
    isSubcategoryOpen,
    selectedSubcategory,
    openSubcategory,
    closeSubcategory,
  };
};
