import { Edition } from "../../../screens/Editions/EditionsScreen";
import { Styles } from "../../../utils/Styles";
import { EditionCard } from "./EditionCard";

type EditionsListProps = {
  editions: Edition[];
  handleDeleteClick: (edition: Edition) => void;
  handleCopyClick: (edition: Edition) => void;
  handleEditClick: (edition: Edition) => void;
};

export const EditionsList = ({
  editions,
  handleDeleteClick,
  handleCopyClick,
  handleEditClick,
}: EditionsListProps) => {
  return (
    <div style={styles.container}>
      {editions.map((edition) => (
        <EditionCard
          edition={edition}
          handleDeleteClick={() => handleDeleteClick(edition)}
          handleCopyClick={() => handleCopyClick(edition)}
          handleEditClick={() => handleEditClick(edition)}
        />
      ))}
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    gap: 12,
    flexDirection: "row",
    margin: 12,
  },
};
