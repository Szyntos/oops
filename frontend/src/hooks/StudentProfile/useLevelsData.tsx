import { useEditionSelection } from "../common/useEditionSelection";
import { useLevelsQuery } from "../../graphql/levels.graphql.types";
import { Level } from "./types";

export const useLevelsData = () => {
  const { selectedEdition } = useEditionSelection();
  const editionId = selectedEdition?.editionId;

  const { data, error, loading } = useLevelsQuery({
    variables: { editionId: editionId as string },
    skip: !editionId,
  });

  const levels: Level[] =
    data?.levelSets[0].levels.map((level) => {
      return {
        name: level.name as string,
        ordinalNumber: level.ordinalNumber,
        realLevelNumber: level.ordinalNumber + 1,
        imageId: level.imageFileId ?? undefined,
        minimumPoints: parseFloat(level.minimumPoints),
        maximumPoints: parseFloat(level.maximumPoints),
        grade: parseFloat(level.grade),
      };
    }) ?? [];

  return {
    levels,
    loading,
    error,
  };
};
