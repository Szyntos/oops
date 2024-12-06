import { ProgressBarProps } from "../../../components/bars/ProgressBar";
import { useCategoriesPointsQuery } from "../../../graphql/categoriesPoints.graphql.types";

export const useCategoriesCardData = (props: {
  editionId: string | undefined;
  studentId: string | undefined;
}) => {
  const { editionId, studentId } = props;

  const { data, loading, error, refetch } = useCategoriesPointsQuery({
    variables: {
      editionId: parseInt(editionId as string),
      studentId: parseInt(studentId as string),
    },
    skip: !editionId || !studentId,
  });

  const categories: ProgressBarProps[] =
    data?.getSumOfPointsForStudentByCategory.map((category) => {
      return {
        title: category.category.categoryName.toLocaleLowerCase(),
        bounds: {
          lower: 0,
          upper: category.maxPoints,
        },
        points: category.sumOfAll,
        pointsColor: category.category.darkColor,
        barColor: category.category.lightColor,
      };
    }) ?? [];

  return {
    categories,
    categoriesLoading: loading,
    categoriesError: error,
    categoriesRefetch: refetch,
  };
};
