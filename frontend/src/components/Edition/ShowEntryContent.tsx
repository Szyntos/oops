import { ShowEntryType } from "../../contexts/editionContext";
import { Styles } from "../../utils/Styles";

export type ShowEntryContentProps = {
  selectedEntry?: ShowEntryType;
};
export const ShowEntryContent = ({ selectedEntry }: ShowEntryContentProps) => {
  return (
    <div style={styles.container}>
      <div>{selectedEntry?.__typename ?? "---"}</div>
    </div>
  );
};

const styles: Styles = {
  container: {
    padding: 50,
    backgroundColor: "pink",
  },
};
