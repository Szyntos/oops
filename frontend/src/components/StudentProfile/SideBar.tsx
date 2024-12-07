import { ProgressBarProps } from "../bars/ProgressBar";
import { StudentCard } from "./cards/StudentCard";
import { CategoriesCard } from "./cards/CategoriesCard";
import { Styles } from "../../utils/Styles";
import { StudentCardData } from "../../hooks/StudentProfile/useStudentProfileData/useStudentData";
import { AnimalCard } from "./cards/AnimalCard/AnimalCard";
import { BonusesCard } from "./cards/BonusesCard";
import { Bonus } from "../../hooks/StudentProfile";
import { NeighboringLevel } from "../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { tokens } from "../../tokens";

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
    <div style={styles.container}>
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
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 28,
    backgroundColor: tokens.color.background.cardBlue,
    minWidth: 360,
    maxWidth: 400,
    padding: 16,
  },
};
