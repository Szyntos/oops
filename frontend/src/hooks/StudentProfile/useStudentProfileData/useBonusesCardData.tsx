import { useBonusesQuery } from "../../../graphql/bonuses.graphql.types";
import { Bonus } from "../types";

export const useBonusesCardData = (
  editionId: string | undefined,
  studentId: string | undefined,
) => {
  const { data, loading, error, refetch } = useBonusesQuery({
    variables: {
      editionId: editionId as string,
      studentId: studentId as string,
    },
    skip: !editionId || !studentId,
  });

  const bonuses: Bonus[] =
    data?.bonuses.map((bonus) => {
      return {
        id: bonus.bonusId,
        award: {
          id: bonus.award.awardId,
          name: bonus.award.awardName,
          description: bonus.award.description,
          value: parseFloat(bonus.point.value),
          imgId: bonus.award.imageFileId ?? undefined,
        },
        updatedAt: bonus.updatedAt,
        createdAt: bonus.createdAt,
      };
    }) ?? [];

  return {
    bonuses,
    bonusesLoading: loading,
    bonusesError: error,
    bonusesRefetch: refetch,
  };
};
