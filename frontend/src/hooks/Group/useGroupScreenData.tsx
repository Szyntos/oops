import { useState } from "react";
import { useGroupPointsQuery } from "../../graphql/groupPoints.graphql.types";
import { Category } from "../../utils/utils";
import { useFormCategories } from "../common/useFormCategories";
import { useCreatePointsMutation } from "../../graphql/createPoints.graphql.types";
import { FormPoints } from "../../components/StudentProfile/PointsForm/types";
import { useError } from "../common/useGlobalError";

export type GroupTableRow = {
  student: Student;
  subcategories: SubcategoryPoints[];
};

type Student = {
  id: string;
  fullName: string;
  index: number;
};

export type SubcategoryPoints = {
  pure: number | undefined;
  subcategoryId: string;
  categoryId: string;
};

export const useGroupScreenData = (
  groupId: number | undefined,
  teacherId: string,
) => {
  const { data, loading, error, refetch } = useGroupPointsQuery({
    variables: { groupId: groupId as number },
    skip: !groupId,
  });

  const categories: Category[] =
    data?.getUsersInGroupWithPoints[0]?.categoriesPoints.map((item) => {
      const category = item.category;
      const subcategoryPoints = item.subcategoryPoints;
      return {
        id: category.categoryId,
        name: category.categoryName,
        subcategories:
          subcategoryPoints.map((points) => {
            return {
              id: points.subcategory.subcategoryId,
              name: points.subcategory.subcategoryName,
              maxPoints: parseFloat(points.subcategory.maxPoints),
            };
          }) ?? [],
      };
    }) ?? [];

  const rows: GroupTableRow[] =
    data?.getUsersInGroupWithPoints.map((userPoints) => {
      const user = userPoints?.user;
      return {
        student: {
          id: user?.userId ?? "-1",
          fullName: `${user?.firstName ?? "-"} ${user?.secondName ?? "-"}`,
          index: user?.indexNumber ?? -1,
        },
        subcategories:
          userPoints?.categoriesPoints.flatMap((catPoints) =>
            catPoints.subcategoryPoints.map((subPoints) => {
              return {
                pure: subPoints.points?.value
                  ? parseFloat(subPoints.points?.value)
                  : undefined,
                subcategoryId: subPoints.subcategory.subcategoryId,
                categoryId: catPoints.category.categoryId,
              };
            }),
          ) ?? [],
      };
    }) ?? [];

  const [selectedStudent, setSelectedStudent] = useState<string | undefined>(
    undefined,
  );
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const {
    formCategories,
    loading: formDataLoading,
    error: formDataError,
  } = useFormCategories();

  const { localErrorWrapper } = useError();

  // ADD
  const [isStudentOpen, setIsStudentOpen] = useState<boolean>(false);
  const openStudent = (id: string) => {
    setSelectedStudent(id);
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
          studentId: parseInt(selectedStudent ?? "-1"),
          subcategoryId: parseInt(formPoints.subcategoryId),
          teacherId: parseInt(teacherId),
          value: formPoints.points,
        },
      });
      closeStudent();
      refetch();
    });
  };

  return {
    rows,
    categories,
    loading: loading || formDataLoading,
    error: error || formDataError,

    selectedStudent,
    formError,
    isStudentOpen,
    openStudent,
    closeStudent,

    formCategories,
    handleAddPointsConfirmation,
  };
};
