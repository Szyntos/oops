import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";
import { getLinearGradient } from "../../utils/utils";
import { CustomText } from "../CustomText";
import { Avatar } from "../avatars/Avatar";

export const HALL_OF_FAME_STUDENT_CARD_ID_PREFIX = "student-";

type HallOfFameStudentCardProps = {
  student: HallOfFameStudentData;
  isHighlighted?: boolean;
  showStudentName: boolean;
};

export type HallOfFameStudentData = {
  displayName: string;
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
  showStudentName,
}: HallOfFameStudentCardProps) => {
  return (
    <div
      id={HALL_OF_FAME_STUDENT_CARD_ID_PREFIX + student.id}
      style={{
        ...styles.item,
        background: isHighlighted
          ? getLinearGradient(tokens.color.accent.light, tokens.color.card.blue)
          : undefined,
      }}
    >
      <CustomText style={styles.position}>{student.position}.</CustomText>
      <Avatar id={student.avatarImgId} size={"xs"} />
      <div style={styles.nickAndNAmeContainer}>
        <CustomText bold={true}>{student.nick}</CustomText>
        {showStudentName && <CustomText>{student.displayName}</CustomText>}
      </div>
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
  nickAndNAmeContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  animalName: {
    flex: 1,
    textAlign: "center",
  },
};
