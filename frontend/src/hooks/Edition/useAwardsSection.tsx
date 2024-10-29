import { useState } from "react";

import {
  SetupAwardsQuery,
  useSetupAwardsQuery,
} from "../../graphql/setupAwards.graphql.types";
import { useSetupAwardCreateMutation } from "../../graphql/setupAwardCreate.graphql.types";
import { useSetupAwardEditionAddMutation } from "../../graphql/setupAwardEditionAdd.graphql.types";
import { useSetupAwardEditionRemoveMutation } from "../../graphql/setupAwardEditionRemove.graphql.types";
import { AwardFormValues } from "../../components/Edition/Sections/AwardsSection/AddAwardForm/AddAwardForm";
import { useCategoriesSection } from "./categories/useCategoriesSection";
import { useSetupAwardEditMutation } from "../../graphql/setupAwardEdit.graphql.types";
import { useError } from "../common/useGlobalError";

export type Award = SetupAwardsQuery["award"][number];

export const useAwardsSection = (editionId: number) => {
  const { globalErrorWrapper, localErrorWrapper } = useError();

  const {
    selectedCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesSection(editionId);

  const {
    data,
    loading: awardsLoading,
    error: awardsError,
    refetch,
  } = useSetupAwardsQuery();

  const awards: Award[] = data?.award ?? [];

  const selectedAwards: Award[] = awards.filter((a) =>
    a.awardEditions.some(
      (edition) => edition.editionId === editionId.toString(),
    ),
  );

  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [selectedAward, setSelectedAward] = useState<Award | undefined>(
    undefined,
  );

  // ADD AWARD

  const [isAddAward, setIsAddAward] = useState(false);
  const openAddAward = () => {
    setIsAddAward(true);
  };
  const closeAddAward = () => {
    setIsAddAward(false);
    setFormError(undefined);
  };

  const [createAward] = useSetupAwardCreateMutation();
  const handleAddAward = async (values: AwardFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await createAward({
        variables: {
          ...values,
          categoryId: parseInt(values.categoryId),
          fileId: values.imageId,
          label: "",
        },
      });
      refetch();
      closeAddAward();
    });
  };

  const [addAward] = useSetupAwardEditionAddMutation();
  const [removeAward] = useSetupAwardEditionRemoveMutation();
  const handleSelectAward = async (award: Award) => {
    const isAwardSelected = selectedAwards.some(
      (a) => a.awardId === award.awardId,
    );
    const variables = {
      editionId,
      awardId: parseInt(award.awardId),
    };
    globalErrorWrapper(async () => {
      isAwardSelected
        ? await removeAward({ variables })
        : await addAward({ variables });
      refetch();
    });
  };

  // EDIT AWARD

  const [isEditAward, setIsEditAward] = useState(false);
  const openEditAward = (award: Award) => {
    setSelectedAward(award);
    setIsEditAward(true);
  };
  const closeEditAward = () => {
    setIsEditAward(false);
    setSelectedAward(undefined);
    setFormError(undefined);
  };

  const [editAward] = useSetupAwardEditMutation();
  const handleEditAward = (values: AwardFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await editAward({
        variables: {
          ...values,
          awardId: parseInt(selectedAward?.awardId ?? "-1"),
          categoryId: parseInt(values.categoryId),
          fileId: values.imageId,
        },
      });
      refetch();
      closeEditAward();
    });
  };

  return {
    awards,
    selectedAwards,
    formCategories: selectedCategories,
    loading: awardsLoading || categoriesLoading,
    error: awardsError || categoriesError,

    handleSelectAward,
    formError,

    isAddAward,
    closeAddAward,
    openAddAward,
    handleAddAward,

    isEditAward,
    openEditAward,
    closeEditAward,
    handleEditAward,

    selectedAward,
  };
};
