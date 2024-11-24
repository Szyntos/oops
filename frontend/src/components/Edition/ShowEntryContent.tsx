import { Entry } from "../../contexts/editionContext";
import { EMPTY_FIELD_STRING } from "../../utils/constants";
import { Styles } from "../../utils/Styles";

export type ShowEntryContentProps = {
  selectedEntry?: Entry;
};

export const ShowEntryContent = ({ selectedEntry }: ShowEntryContentProps) => {
  return (
    <div style={styles.container}>
      <pre>{JSON.stringify(selectedEntry, null, 2) ?? EMPTY_FIELD_STRING}</pre>
    </div>
  );
};

const styles: Styles = {
  container: {
    padding: 50,
  },
};
