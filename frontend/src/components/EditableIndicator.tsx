import { tokens } from "../tokens";
import { Styles } from "../utils/Styles";
import { IconMapper } from "./IconMapper";

export const EditableIndicator = () => {
  return (
    <div style={styles.editable}>
      <IconMapper icon={"edit"} />
    </div>
  );
};

const styles: Styles = {
  editable: {
    borderRadius: "100%",
    backgroundColor: tokens.color.accent.dark,
    width: 36,
    height: 36,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};
