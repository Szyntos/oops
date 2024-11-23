import {
  GroupPointsQuery,
  useGroupPointsQuery,
} from "../../graphql/groupPoints.graphql.types";
import { Category } from "../../utils/utils";

export type GroupTableRow = {
  student: Student;
  categories: CategoryPointsEntry[];
};

export type Student = {
  id: string;
  fullName: string;
  index: number;
};

export type CategoryPointsEntry = {
  categoryId: string;
  subcategories: SubcategoryPointsEntry[];
  awards: AwardsPointsEntry[];
  sums: SumsType;
};

export type SubcategoryPointsEntry = {
  pure: number | undefined;
  subcategoryId: string;
  subcategoryName: string;
  categoryId: string;
  maxPoints: number;
};

export type AwardsPointsEntry = {
  value: number | undefined;
  name: string;
};

type SumsType = NonNullable<
  GroupPointsQuery["getUsersInGroupWithPoints"][number]
>["categoriesPoints"][number]["categoryAggregate"];

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
              categoryId: parseInt(category.categoryId),
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
      const student: Student = {
        id: user?.userId ?? "-1",
        fullName: `${user?.firstName ?? "-"} ${user?.secondName ?? "-"}`,
        index: user?.indexNumber ?? -1,
      };

      const categories: CategoryPointsEntry[] =
        userPoints?.categoriesPoints.map((catPoints) => {
          const subcategories: SubcategoryPointsEntry[] =
            catPoints.subcategoryPoints.map((subPoints) => {
              return {
                pure: subPoints.points?.value
                  ? parseFloat(subPoints.points?.value)
                  : undefined,
                subcategoryId: subPoints.subcategory.subcategoryId,
                categoryId: catPoints.category.categoryId,
                subcategoryName: subPoints.subcategory.subcategoryName,
                maxPoints: parseInt(subPoints.subcategory.maxPoints),
              };
            }) ?? [];

          const awards: AwardsPointsEntry[] =
            catPoints.awardAggregate.map((a) => ({
              value: a.sumOfAll ?? undefined,
              name: a.award.awardName,
            })) ?? [];

          return {
            categoryId: catPoints.category.categoryId,
            subcategories,
            awards,
            sums: catPoints.categoryAggregate,
          };
        }) ?? [];

      return {
        student,
        categories,
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
