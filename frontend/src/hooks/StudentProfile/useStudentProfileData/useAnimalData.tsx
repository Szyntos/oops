import { ApolloError } from "@apollo/client";
import {
  useNeighboringLevelsQuery,
  NeighboringLevelsQuery,
} from "../../../graphql/neighbouringLevels.graphql.types";

export type NeighboringLevel =
  NeighboringLevelsQuery["getNeighboringLevels"]["currLevel"];

export type AnimalDataResult = {
  sumOfAllPoints: number | undefined;
  prevLevel: NeighboringLevel | undefined;
  currLevel: NeighboringLevel | undefined;
  nextLevel: NeighboringLevel | undefined;
  animalDataLoading: boolean;
  animalDataError: ApolloError | Error | undefined;
  animalDataRefetch: () => void;
};

export const useAnimalData = (
  editionId: string | undefined,
  studentId: string | undefined,
): AnimalDataResult => {
  const { data, loading, error, refetch } = useNeighboringLevelsQuery({
    skip: !editionId || !studentId,
    variables: {
      editionId: parseInt(editionId as string),
      studentId: parseInt(studentId as string),
    },
  });

  const sumOfAllPoints = data?.getNeighboringLevels.sumOfAllPoints
    ? parseFloat(data.getNeighboringLevels.sumOfAllPoints)
    : undefined;
  const prevLevel = data?.getNeighboringLevels.prevLevel ?? undefined;
  const currLevel = data?.getNeighboringLevels.currLevel ?? undefined;
  const nextLevel = data?.getNeighboringLevels.nextLevel ?? undefined;

  if (!currLevel) {
    return {
      sumOfAllPoints: 0,
      prevLevel: undefined,
      currLevel: undefined,
      nextLevel: undefined,
      animalDataLoading: loading,
      animalDataError: error ?? new Error("Animal card levels are missing."),
      animalDataRefetch: refetch,
    };
  }

  return {
    sumOfAllPoints,
    prevLevel,
    currLevel,
    nextLevel,
    animalDataLoading: loading,
    animalDataError: error,
    animalDataRefetch: refetch,
  };
};
