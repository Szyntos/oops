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

export type Award = SetupAwardsQuery["award"][number];

export const useAwardsSection = (editionId: number) => {
  const {
    data,
    loading: awardsLoading,
    error: awardsError,
    refetch,
  } = useSetupAwardsQuery();

  const {
    selectedCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesSection(editionId);

  const awards: Award[] = data?.award ?? [];

  const selectedAwards: Award[] = awards.filter((a) => {
    const found = a.awardEditions.find(
      (edition) => edition.editionId === editionId.toString(),
    );
    return found !== undefined;
  });

  const [isOpen, setIsOpen] = useState(false);

  const [createAward] = useSetupAwardCreateMutation();
  const [createAwardError, setCreateAwardError] = useState<string | undefined>(
    undefined,
  );

  const [addAward] = useSetupAwardEditionAddMutation();
  const [removeAward] = useSetupAwardEditionRemoveMutation();

  const closeDialog = () => {
    setIsOpen(false);
    setCreateAwardError(undefined);
  };

  const handleCreate = async (values: AwardFormValues) => {
    try {
      await createAward({
        variables: {
          awardName: values.awardName,
          awardType: values.awardType,
          awardValue: values.awardValue,
          categoryId: 1,
          description: values.description,
          maxUsages: values.maxUsages,
          label: "",
        },
      });

      refetch();
      closeDialog();
    } catch (error) {
      console.error(error);

      setCreateAwardError(
        error instanceof Error ? error.message : "Unexpected error received.",
      );
    }
  };

  const handleSelectClick = async (award: Award) => {
    const isAwardSelected = !!selectedAwards.find((a) => {
      return a.awardId === award.awardId;
    });

    const variables = {
      variables: {
        editionId,
        awardId: parseInt(award.awardId),
      },
    };

    try {
      // TODO add some kind of global error
      if (isAwardSelected) {
        await removeAward(variables);
      } else {
        await addAward(variables);
      }
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  return {
    awards,
    selectedAwards,
    formCategories: selectedCategories,
    loading: awardsLoading || categoriesLoading,
    error: awardsError || categoriesError,
    handleSelectClick,
    handleCreate,
    createAwardError,
    isOpen,
    closeDialog,
    openDialog: () => setIsOpen(true),
  };
};
