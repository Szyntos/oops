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
import { useDeleteLevelSetMutation } from "../../graphql/deleteLevelSet.graphql.types";
import { useFilesQuery } from "../../graphql/files.graphql.types";
import { AddedLevel } from "../../components/Edition/Sections/LevelsSection/AddSetForm/LevelRow";

export type LevelSet = SetupLevelSetsQuery["levelSets"][number];

export const useLevelSetsSection = (editionId: number) => {
  const { globalErrorWrapper, localErrorWrapper } = useError();

  const { data, loading, error, refetch } = useSetupLevelSetsQuery();

  const levelSets: LevelSet[] = data?.levelSets ?? [];

  const editionLevelSet: LevelSet = levelSets.filter((s) =>
    s.edition.some((e) => parseInt(e.editionId) === editionId),
  )[0];

  const {
    data: imageData,
    loading: imageLoading,
    error: imageError,
  } = useFilesQuery({ variables: { paths: ["image/level"] } });

  const imageIds: string[] =
    imageData?.getFilesGroupedByTypeBySelectedTypes.flatMap((i) =>
      i.files.map((f) => f.fileId),
    ) ?? [];

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
  const handleAddSet = (levels: AddedLevel[]) => {
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
  const handleSelectSet = (set: LevelSet) => {
    console.log(set);
    const isLevelSetSelected = editionLevelSet?.levelSetId === set.levelSetId;

    const variables = {
      editionId,
      levelSetId: parseInt(set.levelSetId),
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
  const handleEditSet = (levels: AddedLevel[]) => {
    localErrorWrapper(setFormError, async () => {
      await editSet({
        variables: {
          levelSetId: parseInt(selectedLevelSet?.levelSetId ?? "-1"),
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

  // DELETE
  const [deleteSet] = useDeleteLevelSetMutation();
  const handleDeleteSet = (set: LevelSet) => {
    globalErrorWrapper(async () => {
      await deleteSet({ variables: { levelSetId: parseInt(set.levelSetId) } });
      refetch();
    });
  };

  return {
    levelSets,
    editionLevelSet,
    imageIds,
    loading: loading || imageLoading,
    error: error || imageError,

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

    handleDeleteSet,
  };
};
