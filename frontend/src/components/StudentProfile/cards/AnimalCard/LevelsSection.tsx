import { useLevelsData } from "../../../../hooks/StudentProfile/useLevelsData";
import { NeighboringLevel } from "../../../../hooks/StudentProfile/useStudentProfileData/useAnimalData";
import { EMPTY_FIELD_STRING } from "../../../../utils/constants";
import { Styles } from "../../../../utils/Styles";
import { AnimalWithTooltip } from "../../../images/AnimalWithTooltip";

type LevelsSectionProps = {
  studentLevel: NeighboringLevel;
};

export const LevelsSection = ({ studentLevel }: LevelsSectionProps) => {
  const { levels, loading, error } = useLevelsData();

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.title}>All levels</div>
      {levels.length > 0 ? (
        <div style={styles.levelsContainer}>
          {levels?.map((level) => (
            <AnimalWithTooltip
              level={level}
              size={"xs"}
              disabled={level.ordinalNumber > studentLevel.ordinalNumber}
            />
          ))}
        </div>
      ) : (
        <div>{EMPTY_FIELD_STRING}</div>
      )}
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: {
    fontWeight: "bold",
  },
  levelMiniaturesContainer: {
    display: "flex",
    flexDirection: "row",
  },
  levelMiniatureSpaceWrapper: {
    flex: 1,
  },
  levelsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
};
