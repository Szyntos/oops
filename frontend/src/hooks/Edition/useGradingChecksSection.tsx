import { useEffect, useState } from "react";
import { useCategoriesSection } from "./categories/useCategoriesSection";
import { useError } from "../common/useGlobalError";
import { useLevelSetsSection } from "./useLevelSetsSection";
import { useSetupGradingChecksAddMutation } from "../../graphql/setupGradingChecksAdd.graphql.types";
import {
  SetupGradingChecksQuery,
  useSetupGradingChecksQuery,
} from "../../graphql/setupGradingChecks.graphql.types";
import { useSetupGradingChecksEditMutation } from "../../graphql/setupGradingChecksEdit.graphql.types";
import { GradingChecksFormValues } from "../../components/Edition/Sections/GradingChecksSection/ChecksForm";

export type GradingChecks = SetupGradingChecksQuery["gradingChecks"][number];

export const useGradingChecksSection = (editionId: number) => {
  const { localErrorWrapper } = useError();

  const { data, loading, error, refetch } = useSetupGradingChecksQuery({
    variables: { editionId: editionId.toString() },
    fetchPolicy: "no-cache",
  });

  const [gradingChecks, setGradingChecks] = useState<GradingChecks | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!error && !loading && data && data.gradingChecks.length > 0) {
      setGradingChecks(data.gradingChecks[0]);
    } else {
      setGradingChecks(undefined);
    }
  }, [data, error, loading]);

  const {
    selectedCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesSection(editionId);

  const {
    activeSet: selectedLevelSet,
    loading: levelsLoading,
    error: levelsError,
  } = useLevelSetsSection(editionId);

  const [formError, setFormError] = useState<string | undefined>(undefined);

  // ADD
  const [isAddOpened, setIsAddOpened] = useState(false);
  const openAdd = () => {
    setIsAddOpened(true);
  };
  const closeAdd = () => {
    setIsAddOpened(false);
    setFormError(undefined);
  };
  const [createGradingChecks] = useSetupGradingChecksAddMutation();
  const handleAdd = async (values: GradingChecksFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await createGradingChecks({
        variables: {
          editionId,
          endOfLabsDate: values.endOfLabsDate,
          endOfLabsLevelsThreshold: parseFloat(values.endOfLabsLevelsThreshold),
          projectId: parseInt(values.projectId),
          projectPointsThreshold: values.projectPointsThreshold,
        },
      });
      refetch();
      closeAdd();
    });
  };

  // EDIT AWARD
  const [isEditOpened, setIsEditOpened] = useState(false);
  const openEdit = () => {
    setIsEditOpened(true);
  };
  const closeEdit = () => {
    setIsEditOpened(false);
    setFormError(undefined);
  };

  const [editGradingChecks] = useSetupGradingChecksEditMutation();
  const handleEdit = (values: GradingChecksFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await editGradingChecks({
        variables: {
          gradingCheckId: parseInt(gradingChecks?.gradingCheckId as string),
          endOfLabsDate: values.endOfLabsDate,
          endOfLabsLevelsThreshold: parseFloat(values.endOfLabsLevelsThreshold),
          projectId: parseInt(values.projectId),
          projectPointsThreshold: values.projectPointsThreshold,
        },
      });
      refetch();
      closeEdit();
    });
  };

  return {
    gradingChecks,
    formCategories: selectedCategories,
    formLevels: selectedLevelSet ? selectedLevelSet.levelSet.levels : [],
    loading: loading || categoriesLoading || levelsLoading,
    error: error || categoriesError || levelsError,

    formError,

    isAddOpened,
    closeAdd,
    openAdd,
    handleAdd,

    isEditOpened,
    openEdit,
    closeEdit,
    handleEdit,
  };
};
