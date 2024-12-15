import { ProgressBarProps } from "../bars/ProgressBar";
import { StudentCard } from "./cards/StudentCard";
import { CategoriesCard } from "./cards/CategoriesCard";
import { StudentCardData } from "../../hooks/StudentProfile/useStudentProfileData/useStudentData";
import { AnimalCard } from "./cards/AnimalCard/AnimalCard";
import { BonusesCard } from "./cards/BonusesCard";
import { Bonus } from "../../hooks/StudentProfile";
import { NeighboringLevel } from "../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { CustomSideBar } from "../layout/CustomSideBar";
import { ChecksCard } from "./cards/ChecksCard";

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
      <AnimalCard
        prevLevel={prevLevel}
        currLevel={currLevel}
        nextLevel={nextLevel}
        totalPoints={sumOfAllPoints}
      />
      <ChecksCard
        levelCheck={student.levelCheck}
        projectCheck={student.projectCheck}
      />
      <CategoriesCard
        categoriesBarProps={categoriesBarProps}
        totalPoints={sumOfAllPoints ?? 0}
      />
      <BonusesCard bonuses={bonuses} />
    </CustomSideBar>
  );
};
