import { ProgressBarProps } from "../bars/ProgressBar";
import { StudentCard } from "./cards/StudentCard";
import { CategoriesCard } from "./cards/CategoriesCard";
import { StudentCardData } from "../../hooks/StudentProfile/useStudentProfileData/useStudentData";
import { AnimalCard } from "./cards/AnimalCard/AnimalCard";
import { BonusesCard } from "./cards/BonusesCard";
import { Bonus } from "../../hooks/StudentProfile";
import { NeighboringLevel } from "../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { CustomSideBar } from "../layout/CustomSideBar";

type SideBarProps = {
  student: StudentCardData;
  categoriesBarProps: ProgressBarProps[];
  sumOfAllPoints: number | undefined;
  prevLevel: NeighboringLevel | undefined;
  currLevel: NeighboringLevel;
  nextLevel: NeighboringLevel | undefined;
  bonuses: Bonus[];
};

export const SideBar = ({
  student,
  categoriesBarProps,
  sumOfAllPoints,
  prevLevel,
  currLevel,
  nextLevel,
  bonuses,
}: SideBarProps) => {
  return (
    <CustomSideBar>
      <StudentCard {...student} />
      <CategoriesCard
        categoriesBarProps={categoriesBarProps}
        totalPoints={sumOfAllPoints ?? 0}
      />
      <AnimalCard
        prevLevel={prevLevel}
        currLevel={currLevel}
        nextLevel={nextLevel}
        totalPoints={sumOfAllPoints}
      />
      <BonusesCard bonuses={bonuses} />
    </CustomSideBar>
  );
};
