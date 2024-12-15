import { LevelProgressBar } from "../../../bars/LevelProgressBar/LevelProgressBar";
import { NeighboringLevel } from "../../../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { Section } from "../Section/Section";
import { ItemWithIcon, ItemWithIconProps } from "../Section/ItemWithIcon";
import { Styles } from "../../../../utils/Styles";
import { LevelsSection } from "./LevelsSection";
import { Avatar } from "../../../avatars/Avatar";

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
  const items: ItemWithIconProps[] = [
    { icon: "monster", title: currLevel.levelName },
    { icon: "level", title: `lvl. ${currLevel.ordinalNumber + 1}` },
    { icon: "level", title: currLevel.grade },
    {
      icon: "points",
      title: `${parseFloat(currLevel.minimumPoints).toFixed(2)} - ${parseFloat(currLevel.maximumPoints).toFixed(2)}`,
    },
  ];

  return (
    <>
      <Section title="Twój zwierzak">
        <div style={styles.animalContainer}>
          <Avatar id={currLevel.imageFile?.fileId} size="l" />
          <div style={styles.itemsContainer}>
            {items.map((item) => (
              <ItemWithIcon {...item} />
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

      <Section title="Zdobyte poziomy">
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
