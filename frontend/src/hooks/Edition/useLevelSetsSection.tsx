import { useState } from "react";
import { useError } from "../common/useGlobalError";
import {
  SetupLevelSetsQuery,
  useSetupLevelSetsQuery,
} from "../../graphql/setupLevelSets.graphql.types";
import { LevelSetFormValues } from "../../components/Edition/Sections/LevelsSection/LevelSetForm/AddLevelSetForm";

export type LevelSet = SetupLevelSetsQuery["getLevelSets"][number];

export const useLevelSetsSection = (editionId: number) => {
  const { localErrorWrapper } = useError();

  console.log(editionId);

  const { data, loading, error } = useSetupLevelSetsQuery();

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

  // TODO
  //   const [createSet] = useSetupAwardCreateMutation();
  const handleAddSet = async (values: LevelSetFormValues) => {
    localErrorWrapper(setFormError, async () => {
      console.log(values);
      //   await createAward({
      //     variables: {
      //       ...values,
      //       categoryId: parseInt(values.categoryId),
      //       fileId: parseInt(values.imageId ?? "-1"),
      //       label: "",
      //     },
      //   });
      //   refetch();
      //   closeAddSet();
    });
  };

  // SELECT
  //   const [addSet] = useSetupAwardEditionAddMutation();
  //   const [removeSet] = useSetupAwardEditionRemoveMutation();
  const handleSelectSet = async (set: LevelSet) => {
    console.log(set);
    // const isAwardSelected = selectedLevelSets.some(
    //   (a) => a.awardId === set.awardId
    // );
    // const variables = {
    //   editionId,
    //   awardId: parseInt(set.awardId),
    // };
    // globalErrorWrapper(async () => {
    //   isAwardSelected
    //     ? await removeSet({ variables })
    //     : await addSet({ variables });
    //   refetch();
    // });
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

  //   const [editSet] = useSetupAwardEditMutation();
  const handleEditSet = (values: LevelSetFormValues) => {
    localErrorWrapper(setFormError, async () => {
      console.log(values);
      //   await editSet({
      //     variables: {
      //       ...values,
      //       awardId: parseInt(selectedAward?.awardId ?? "-1"),
      //       categoryId: parseInt(values.categoryId),
      //       fileId: parseInt(values.imageId ?? "-1"),
      //     },
      //   });
      //   refetch();
      //   closeEditSet();
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
