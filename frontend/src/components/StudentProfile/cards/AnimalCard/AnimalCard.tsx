import { Avatar } from "../../../images/Avatar";
import { LevelProgressBar } from "../../../bars/LevelProgressBar/LevelProgressBar";
import { NeighboringLevel } from "../../../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { Section } from "../Card/Section";
import { CardItem, CardItemProps } from "../Card/CardItem";
import { Styles } from "../../../../utils/Styles";
import { LevelsSection } from "./LevelsSection";

type AnimalCardProps = {
  totalPoints: number | undefined;
  prevLevel: NeighboringLevel | undefined;
  currLevel: NeighboringLevel;
  nextLevel: NeighboringLevel | undefined;
};

export const AnimalCard = ({
  currLevel,
  prevLevel,
  nextLevel,
  totalPoints,
}: AnimalCardProps) => {
  const items: CardItemProps[] = [
    { icon: "monster", title: "wielka bestia" },
    { icon: "level", title: "lvl. 6" },
    { icon: "level", title: currLevel.grade },
    { icon: "points", title: "123 - 254" },
  ];

  return (
    <>
      <Section title="Twój zwierzak">
        <div style={styles.animalContainer}>
          <Avatar id={currLevel.imageFile?.fileId} size="l" />
          <div style={styles.itemsContainer}>
            {items.map((item) => (
              <CardItem {...item} />
            ))}
          </div>
        </div>

        <LevelProgressBar
          totalPoints={totalPoints}
          prevLevel={prevLevel}
          currLevel={currLevel}
          nextLevel={nextLevel}
        />
      </Section>

      <Section title="Zdobyte zweirzaki">
        <LevelsSection studentLevel={currLevel} currLevel={currLevel} />
      </Section>
    </>
  );
};

const styles: Styles = {
  animalContainer: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  itemsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
};
