import { tokens } from "../../../tokens";
import { Styles } from "../../../utils/Styles";
import { CustomText } from "../../CustomText";
import { CustomImage } from "../../images/Image";
import { HallOfFameStudentData } from "../HallOfFameStudentCard";

const PODIUM_RADIUS = 8;

type PodiumItemProps = {
  student: HallOfFameStudentData;
  place: 1 | 2 | 3;
};

export const PodiumItem = ({ student, place }: PodiumItemProps) => {
  const getBoxHeight = () => {
    if (place === 1) {
      return 220 * 1.15;
    }
    return (place === 2 ? 150 : 110) * 1.15;
  };

  const getPodiumShadow = () => {
    let color = "";
    switch (place) {
      case 1:
        color = "#FFD700";
        break;
      case 2:
        color = "#C0C0C0";
        break;
      case 3:
        color = "#CD7F32";
        break;
    }
    return { boxShadow: `0px 0px 12px ${color}` };
  };

  return (
    <div style={styles.container}>
      <div style={styles.studentContainer}>
        <CustomImage
          id={student.avatarImgId}
          size={"l"}
          disabled={false}
          imageStyle={getPodiumShadow()}
        />
        <CustomText size={tokens.font.title}>{student.nick}</CustomText>
      </div>
      <div
        style={{
          ...styles.box,
          height: getBoxHeight(),
          backgroundColor: place === 1 ? "gray" : "lightgrey",
          borderTopRightRadius: place !== 2 ? PODIUM_RADIUS : 0,
          borderTopLeftRadius: place !== 3 ? PODIUM_RADIUS : 0,
        }}
      >
        <CustomText
          style={styles.place}
          color={tokens.color.background.primary}
          size={tokens.font.title}
        >
          {place}
        </CustomText>
      </div>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: 240,
  },
  studentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
  },
  box: {
    display: "flex",
    flexDirection: "column",
    // alignItems: "center",
    paddingTop: 12,
  },
  place: {
    backgroundColor: "white",
    width: 32,
    height: 32,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    marginLeft: 12,
  },
};
