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
import { useCopyLevelSetMutation } from "../../graphql/copyLevelSet.graphql.types";
import { useConfirmPopup } from "../common/useConfrimPopup";

export type LevelSet = SetupLevelSetsQuery["listSetupLevelSets"][number];
export type Level = LevelSet["levelSet"]["levels"][number];

export const useLevelSetsSection = (editionId: number) => {
  const { globalErrorWrapper, localErrorWrapper } = useError();

  const { data, loading, error, refetch } = useSetupLevelSetsQuery({
    variables: { editionId },
  });

  const levelSets: LevelSet[] = data?.listSetupLevelSets ?? [];

  const activeSet: LevelSet = levelSets.filter((s) =>
    s.levelSet.edition.some((e) => parseInt(e.editionId) === editionId),
  )[0];

  const {
    data: imageData,
    loading: imageLoading,
    error: imageError,
  } = useFilesQuery({ variables: { paths: ["image/level"] } });

  const imageIds: string[] =
    imageData?.getFilesGroupedByTypeBySelectedTypes.flatMap((i) =>
      i.files.map((f) => f.file.fileId),
    ) ?? [];

  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [selectedToEditSet, setSelectedToEditSet] = useState<
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
            imageFileId: l.imageId,
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
    const isLevelSetSelected =
      activeSet?.levelSet.levelSetId === set.levelSet.levelSetId;

    const variables = {
      editionId,
      levelSetId: parseInt(set.levelSet.levelSetId),
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
    setSelectedToEditSet(levelSet);
    setIsEditSetOpen(true);
  };
  const closeEditSet = () => {
    setIsEditSetOpen(false);
    setSelectedToEditSet(undefined);
    setFormError(undefined);
  };

  const [editSet] = useEditLevelSetMutation();
  const handleEditSet = (levels: AddedLevel[]) => {
    localErrorWrapper(setFormError, async () => {
      await editSet({
        variables: {
          levelSetId: parseInt(selectedToEditSet?.levelSet.levelSetId ?? "-1"),
          levels: levels.map((l) => ({
            grade: l.grade,
            maximumPoints: l.maxPoints.toString(),
            name: l.name,
            imageFileId: l.imageId,
          })),
        },
      });
      refetch();
      closeEditSet();
    });
  };

  // DELETE
  const { openConfirmPopup } = useConfirmPopup();
  const [deleteSet] = useDeleteLevelSetMutation();
  const handleDeleteSet = (set: LevelSet) => {
    openConfirmPopup(() => {
      globalErrorWrapper(async () => {
        await deleteSet({
          variables: { levelSetId: parseInt(set.levelSet.levelSetId) },
        });
        refetch();
      });
    });
  };

  // COPY
  const [copySet] = useCopyLevelSetMutation();
  const handleCopySet = (set: LevelSet) => {
    globalErrorWrapper(async () => {
      await copySet({
        variables: { levelSetId: parseInt(set.levelSet.levelSetId) },
      });
      refetch();
    });
  };

  return {
    levelSets,
    activeSet,
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

    selectedToEditSet,

    handleDeleteSet,

    handleCopySet,
  };
};
