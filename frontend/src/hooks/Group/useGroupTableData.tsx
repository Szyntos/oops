import { useGroupPointsQuery } from "../../graphql/groupPoints.graphql.types";
import { Category } from "../../utils/utils";

export type GroupTableRow = {
  student: Student;
  subcategories: SubcategoryPointsEntry[];
};

export type Student = {
  id: string;
  fullName: string;
  index: number;
};

export type SubcategoryPointsEntry = {
  pure: number | undefined;
  subcategoryId: string;
  categoryId: string;
};

export const useGroupTableData = (groupId: number | undefined) => {
  const {
    data,
    loading: tableLoading,
    error: tableError,
    refetch: tableRefetch,
  } = useGroupPointsQuery({
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

  return {
    rows,
    categories,
    tableLoading,
    tableError,
    tableRefetch,
  };
};
