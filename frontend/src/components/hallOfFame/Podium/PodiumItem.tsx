import { tokens } from "../../../tokens";
import { Styles } from "../../../utils/Styles";
import { CustomText } from "../../CustomText";
import { CustomImage } from "../../images/CustomImage";
import { HallOfFameStudentData } from "../HallOfFameStudentCard";
import { CSSProperties } from "react";

const PODIUM_TOP_RADIUS = 4;
const PODIUM_BOTTOM_RADIUS = 4;

type PodiumItemProps = {
  student: HallOfFameStudentData;
  place: 1 | 2 | 3;
};

const placeMap = {
  color: {
    1: tokens.color.unique.gold,
    2: tokens.color.unique.silver,
    3: tokens.color.unique.brown,
  },
  height: {
    1: 220,
    2: 150,
    3: 110,
  },
};

const PLACE_HEIGHT_RATIO = 1.15;

export const PodiumItem = ({ student, place }: PodiumItemProps) => {
  const getPodiumShadow = () => {
    return { boxShadow: `0px 0px 12px ${placeMap.color[place]}` };
  };

  const getPodiumStyle = (): CSSProperties => {
    return {
      borderTopRightRadius: place !== 2 ? PODIUM_TOP_RADIUS : 0,
      borderTopLeftRadius: place !== 3 ? PODIUM_TOP_RADIUS : 0,
      borderBottomLeftRadius: place === 2 ? PODIUM_BOTTOM_RADIUS : 0,
      borderBottomRightRadius: place === 3 ? PODIUM_BOTTOM_RADIUS : 0,
      backgroundColor:
        place === 1 ? tokens.color.accent.dark : tokens.color.accent.light,
      height: placeMap.height[place] * PLACE_HEIGHT_RATIO,
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.studentContainer}>
        <CustomImage
          id={student.avatarImgId}
          size={"l"}
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
    alignItems: "center",
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
