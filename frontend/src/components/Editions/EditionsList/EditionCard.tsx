import { useNavigate } from "react-router-dom";
import { Edition } from "../../../screens/Editions/EditionsScreen";
import { Styles } from "../../../utils/Styles";
import { pathsGenerator } from "../../../router/paths";
import { SetupButtons } from "../../Edition/Sections/SetupButtons";

type EditionCardProps = {
  edition: Edition;
  handleDeleteClick: () => void;
  handleCopyClick: () => void;
  handleEditClick: () => void;
};

export const EditionCard = ({
  edition,
  handleDeleteClick,
  handleCopyClick,
  handleEditClick,
}: EditionCardProps) => {
  const navigate = useNavigate();

  return (
    <div style={styles.card} key={edition.editionId}>
      <div>
        edition {edition.editionId},{" "}
        {`${edition.startDate.slice(0, 4)}/${edition.endDate.slice(0, 4)}`}
      </div>
      <button
        style={styles.showButton}
        onClick={() =>
          navigate(pathsGenerator.coordinator.Edition(edition.editionId))
        }
      >
        show
      </button>
      <SetupButtons
        isSelected={false}
        handleDelete={handleDeleteClick}
        handleCopy={handleCopyClick}
        handleEdit={handleEditClick}
        //permissions={}
      />
    </div>
  );
};

const styles: Styles = {
  card: {
    border: "1px solid black",
    padding: 12,
  },
  showButton: {
    backgroundColor: "green",
    padding: 4,
    cursor: "pointer",
  },
};
