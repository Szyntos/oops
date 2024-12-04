import { Group } from "../../../hooks/common/useGroupsData";
import { FETCH_FILES_URL } from "../../../utils/constants";
import { Styles } from "../../../utils/Styles";
import { EditableIndicator } from "../../EditableIndicator";

type GroupCardProps = {
  group: Group;
  onClick: () => void;
  withEditableRights: boolean;
};

export const GroupCard = ({
  group,
  onClick,
  withEditableRights,
}: GroupCardProps) => {
  return (
    <div style={styles.container} onClick={onClick}>
      <img
        src={`${FETCH_FILES_URL}${group.imageId}`}
        alt={`id obrazka ${group.imageId}`}
        style={styles.img}
      />
      <div style={styles.title}>{group.name}</div>
      <div>{group.teacher.fullName}</div>
      <div>
        {group.weekday.name} {group.time.start}-{group.time.end}
      </div>
      {withEditableRights && (
        <div style={styles.editableIndicatorWrapper}>
          <EditableIndicator />
        </div>
      )}
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid black",
    width: 240,
    height: 240,
    cursor: "pointer",
    padding: 12,
    gap: 12,
    position: "relative",
  },
  img: {
    width: "100%",
    height: 150,
    objectFit: "cover",
    borderRadius: 8,
    overflow: "hidden",
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
  },
  editableIndicatorWrapper: {
    top: 140,
    right: 32,
    position: "absolute",
  },
};
