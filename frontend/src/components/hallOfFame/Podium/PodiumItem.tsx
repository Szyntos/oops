import { tokens } from "../../../tokens";
import { Styles } from "../../../utils/Styles";
import { CustomText } from "../../CustomText";
import { Avatar } from "../../avatars/Avatar";
import { HallOfFameStudentData } from "../HallOfFameStudentCard";
import { CSSProperties } from "react";

const PODIUM_TOP_RADIUS = 8;
const PODIUM_BOTTOM_RADIUS = 8;

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
    1: 3,
    2: 2,
    3: 1.2,
  },
};

const PLACE_HEIGHT_RATIO = 120;

export const PodiumItem = ({ student, place }: PodiumItemProps) => {
  const getPodiumShadow = () => {
    return { boxShadow: `0px 0px 20px ${placeMap.color[place]}` };
  };

  const getPodiumStyle = (): CSSProperties => {
    return {
      borderTopRightRadius: place !== 2 ? PODIUM_TOP_RADIUS : 0,
      borderTopLeftRadius: place !== 3 ? PODIUM_TOP_RADIUS : 0,
      borderBottomLeftRadius: place === 2 ? PODIUM_BOTTOM_RADIUS : 0,
      borderBottomRightRadius: place === 3 ? PODIUM_BOTTOM_RADIUS : 0,
      backgroundColor: placeMap.color[place],
      height: placeMap.height[place] * PLACE_HEIGHT_RATIO,
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.studentContainer}>
        <Avatar
          id={student.avatarImgId}
          size={"l"}
          imageStyle={getPodiumShadow()}
        />
        <CustomText size={tokens.font.title} bold={true}>
          {student.nick}
        </CustomText>
      </div>
      <div
        style={{
          ...styles.box,
          ...getPodiumStyle(),
        }}
      >
        <CustomText
          style={styles.place}
          color={tokens.color.accent.dark}
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
    width: 220,
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
