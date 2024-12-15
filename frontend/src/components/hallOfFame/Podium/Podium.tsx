import { Styles } from "../../../utils/Styles";
import { HallOfFameStudentData } from "../HallOfFameStudentCard";
import { PodiumItem } from "./PodiumItem";

type PodiumProps = {
  students: HallOfFameStudentData[];
};

export const Podium = ({ students }: PodiumProps) => {
  const n = students.length;
  const firstPlaceStudent = n > 0 ? students[0] : undefined;
  const secondPlaceStudent = n > 1 ? students[1] : undefined;
  const thirdPlaceStudent = n > 2 ? students[2] : undefined;

  return (
    <div style={styles.container}>
      <div style={styles.podium}>
        {secondPlaceStudent && (
          <PodiumItem student={secondPlaceStudent} place={2} />
        )}
        {firstPlaceStudent && (
          <PodiumItem student={firstPlaceStudent} place={1} />
        )}
        {thirdPlaceStudent && (
          <PodiumItem student={thirdPlaceStudent} place={3} />
        )}
      </div>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    height: "60%",
    alignItems: "center",
    justifyContent: "center",
  },
  podium: {
    display: "flex",
    alignItems: "flex-end",
  },
};
