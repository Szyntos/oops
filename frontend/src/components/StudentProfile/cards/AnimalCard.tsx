import { LevelType } from "../../../__generated__/schema.graphql.types";
import { Styles } from "../../../utils/Styles";
import { PointsBar } from "../../PointsBar";

const styles: Styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid blue",
    gap: 12,
    padding: 24,
  },
  title: {
    fontWeight: "bold",
  },
  neighborLevelsContainer: {
    display: "flex",
    flexDirection: "row",
  },
  levelContainer: {
    flex: 1,
  },
};

type AnimalCardProps = {
  prevLevel?: LevelType;
  currLevel: LevelType;
  nextLevel?: LevelType;
  totalPoints: number;
};

export const AnimalCard = ({
  currLevel,
  prevLevel,
  nextLevel,
  totalPoints,
}: AnimalCardProps) => {
  console.log("CURR: ", currLevel);

  return (
    <div style={styles.card}>
      <div style={styles.title}>
        {currLevel.levelName} - lvl. {currLevel.ordinalNumber}
      </div>
      {/* // TODO we have a problem with backend data inconsistency */}
      <PointsBar
        points={
          totalPoints > currLevel.minimumPoints
            ? totalPoints
            : currLevel.minimumPoints + 2
        }
        bounds={{
          lower: currLevel.minimumPoints,
          upper: currLevel.maximumPoints,
        }}
        showPoints
      />
      <div style={styles.neighborLevelsContainer}>
        <div style={styles.levelContainer}>
          {prevLevel && (
            <div>
              <div>lvl. {prevLevel.ordinalNumber}</div>
              <div>{prevLevel.levelName}</div>
            </div>
          )}
        </div>
        <div style={styles.levelContainer}>
          {nextLevel && (
            <div>
              <div>lvl. {nextLevel.ordinalNumber}</div>
              <div>{nextLevel.levelName}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};