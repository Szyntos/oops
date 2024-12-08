import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";
import { CustomText } from "../CustomText";
import { Avatar } from "../images/Avatar";

export const HALL_OF_FAME_STUDENT_CARD_ID_PREFIX = "student-";

type HallOfFameStudentCardProps = {
  student: HallOfFameStudentData;
  isHighlighted?: boolean;
};

export type HallOfFameStudentData = {
  position: number;
  id: string;
  nick: string;
  levelName: string;
  totalPoints: number;
  groupId: string;
  avatarImgId?: string;
  levelImgId?: string;
};

export const HallOfFameStudentCard = ({
  student,
  isHighlighted,
}: HallOfFameStudentCardProps) => {
  return (
    <div
      id={HALL_OF_FAME_STUDENT_CARD_ID_PREFIX + student.id}
      style={{
        ...styles.item,
        ...(isHighlighted
          ? {
              background: `linear-gradient(to right, ${tokens.color.accent.light}, ${tokens.color.card.blue})`,
            }
          : undefined),
      }}
    >
      <CustomText style={styles.position}>{student.position}.</CustomText>
      <Avatar id={student.avatarImgId} size={"xs"} />
      <CustomText style={styles.nick}>{student.nick}</CustomText>
      <Avatar id={student.levelImgId} size={"xs"} />
      <CustomText style={styles.animalName}>{student.levelName}</CustomText>
      <CustomText>{student.totalPoints.toFixed(2)}pkt</CustomText>
    </div>
  );
};

const styles: Styles = {
  item: {
    display: "flex",
    alignItems: "center",
    gap: 32,
    padding: 12,
    paddingLeft: 24,
    paddingRight: 24,
    backgroundColor: tokens.color.card.blue,
  },
  position: {
    width: 18,
  },
  nick: {
    flex: 1,
    fontWeight: "bold",
  },
  animalName: {
    flex: 1,
    textAlign: "center",
  },
};
