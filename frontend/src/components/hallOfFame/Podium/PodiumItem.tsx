import { tokens } from "../../../tokens";
import { Styles } from "../../../utils/Styles";
import { CustomText } from "../../CustomText";
import { CustomImage } from "../../images/Image";
import { HallOfFameStudentData } from "../HallOfFameStudentCard";
import { CSSProperties } from "react";

const PODIUM_TOP_RADIUS = 4;
const PODIUM_BOTTOM_RADIUS = 4;

type PodiumItemProps = {
  student: HallOfFameStudentData;
  place: 1 | 2 | 3;
};

export const PodiumItem = ({ student, place }: PodiumItemProps) => {
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

  const getPodiumStyle = (): CSSProperties => {
    let height = 0;
    switch (place) {
      case 1:
        height = 220;
        break;
      case 2:
        height = 150;
        break;
      case 3:
        height = 110;
        break;
    }

    return {
      borderTopRightRadius: place !== 2 ? PODIUM_TOP_RADIUS : 0,
      borderTopLeftRadius: place !== 3 ? PODIUM_TOP_RADIUS : 0,
      borderBottomLeftRadius: place === 2 ? PODIUM_BOTTOM_RADIUS : 0,
      borderBottomRightRadius: place === 3 ? PODIUM_BOTTOM_RADIUS : 0,
      backgroundColor:
        place === 1 ? tokens.color.accent.dark : tokens.color.accent.light,
      height: height * 1.15,
    };
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
          ...getPodiumStyle(),
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
