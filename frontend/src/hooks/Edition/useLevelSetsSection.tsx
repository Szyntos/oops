import { useState } from "react";
import { useError } from "../common/useGlobalError";
import {
  SetupLevelSetsQuery,
  useSetupLevelSetsQuery,
} from "../../graphql/setupLevelSets.graphql.types";
import { useEditLevelSetMutation } from "../../graphql/editLevelSet.graphql.types";
import { useSetupLevelSetEditionAddMutation } from "../../graphql/setupLevelSetEditionAdd.graphql.types";
import { useSetupLevelSetEditionRemoveMutation } from "../../graphql/setupLevelSetEditionRemove.graphql.types";
import { useAddLevelSetMutation } from "../../graphql/addLevelSet.graphql.types";
import { RowLevel } from "../../components/Edition/Sections/LevelsSection/LevelsRows/LevelRow";

export type LevelSet = SetupLevelSetsQuery["getLevelSets"][number];

export const useLevelSetsSection = (editionId: number) => {
  const { globalErrorWrapper, localErrorWrapper } = useError();

  const { data, loading, error, refetch } = useSetupLevelSetsQuery();

  const levelSets: LevelSet[] = data?.getLevelSets ?? [];

  const selectedLevelSets: LevelSet[] = levelSets.filter(
    (s) => s && parseInt(s.editionId as string) === editionId,
  );

  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [selectedLevelSet, setSelectedLevelSet] = useState<
    LevelSet | undefined
  >(undefined);

  // ADD
  const [isAddSetOpen, setIsAddSetOpen] = useState(false);
  const openAddSet = () => {
    setIsAddSetOpen(true);
  };
  const closeAddSet = () => {
    setIsAddSetOpen(false);
    setFormError(undefined);
  };

  const [addLevelSet] = useAddLevelSetMutation();
  const handleAddSet = (levels: RowLevel[]) => {
    localErrorWrapper(setFormError, async () => {
      await addLevelSet({
        variables: {
          levels: levels.map((l) => ({
            grade: l.grade,
            maximumPoints: l.maxPoints.toString(),
            name: l.name,
          })),
        },
      });
      refetch();
      closeAddSet();
    });
  };

  // SELECT
  const [addSet] = useSetupLevelSetEditionAddMutation();
  const [removeSet] = useSetupLevelSetEditionRemoveMutation();
  const handleSelectSet = async (set: LevelSet) => {
    console.log(set);
    const isLevelSetSelected = selectedLevelSets.some(
      (l) => l.levelSetId === set.levelSetId,
    );
    const variables = {
      editionId,
      levelSetId: set.levelSetId,
    };
    globalErrorWrapper(async () => {
      isLevelSetSelected
        ? await removeSet({ variables })
        : await addSet({ variables });
      refetch();
    });
  };

  // EDIT
  const [isEditSetOpen, setIsEditSetOpen] = useState(false);
  const openEditSet = (levelSet: LevelSet) => {
    setSelectedLevelSet(levelSet);
    setIsEditSetOpen(true);
  };
  const closeEditSet = () => {
    setIsEditSetOpen(false);
    setSelectedLevelSet(undefined);
    setFormError(undefined);
  };

  const [editSet] = useEditLevelSetMutation();
  const handleEditSet = (levels: RowLevel[]) => {
    localErrorWrapper(setFormError, async () => {
      await editSet({
        variables: {
          levelSetId: selectedLevelSet?.levelSetId ?? -1,
          levels: levels.map((l) => ({
            grade: l.grade,
            maximumPoints: l.maxPoints.toString(),
            name: l.name,
          })),
        },
      });
      refetch();
      closeEditSet();
    });
  };

  return {
    levelSets,
    selectedLevelSets,
    loading,
    error,

    handleSelectSet,
    formError,

    isAddSetOpen,
    closeAddSet,
    openAddSet,
    handleAddSet,

    isEditSetOpen,
    openEditSet,
    closeEditSet,
    handleEditSet,

    selectedLevelSet,
  };
};
