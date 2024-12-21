import { tokens } from "../tokens";
import { Styles } from "../utils/Styles";

export const EditableIndicator = () => {
  return (
    <div style={styles.editable}>
      <div style={styles.editIcon}>✎</div>
    </div>
  );
};

const styles: Styles = {
  editable: {
    borderRadius: "100%",
    backgroundColor: tokens.color.accent.light,
    width: 36,
    height: 36,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    fontSize: 22,
    color: tokens.color.text.primary,
  },
};
