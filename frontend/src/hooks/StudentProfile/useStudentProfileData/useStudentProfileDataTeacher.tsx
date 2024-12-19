import { useEditionSelection } from "../../common/useEditionSelection";
import { useAnimalData } from "./useAnimalData";
import { useBonusesCardData } from "./useBonusesCardData";
import { useCategoriesCardData } from "./useCategoriesCardData";
import { useStudentDataTeacher } from "./useStudentDataTeacher";

export const useStudentProfileDataTeacher = (studentId?: string) => {
  const { selectedEdition } = useEditionSelection();
  const editionId = selectedEdition?.editionId;

  const { categories, categoriesLoading, categoriesError, categoriesRefetch } =
    useCategoriesCardData({
      editionId,
      studentId,
    });

  const {
    studentData,
    points,
    filterHeaderNames,
    studentPointsLoading,
    studentPointsError,
    studentPointsRefetch,
  } = useStudentDataTeacher({ editionId, studentId });

  const {
    sumOfAllPoints,
    prevLevel,
    currLevel,
    nextLevel,
    animalDataLoading,
    animalDataError,
    animalDataRefetch,
  } = useAnimalData(editionId, studentId);

  const { bonuses, bonusesLoading, bonusesError, bonusesRefetch } =
    useBonusesCardData(editionId, studentId);

  const refetch = () => {
    categoriesRefetch();
    studentPointsRefetch();
    animalDataRefetch();
    bonusesRefetch();
  };

  return {
    categories,
    studentData,
    points,
    filterHeaderNames,
    sumOfAllPoints,
    prevLevel,
    currLevel,
    nextLevel,
    bonuses,
    // TODO loading and error probably should be separated to sidebar and table
    loading:
      categoriesLoading ||
      studentPointsLoading ||
      animalDataLoading ||
      bonusesLoading,
    error:
      categoriesError || studentPointsError || animalDataError || bonusesError,
    refetch,
  };
};
