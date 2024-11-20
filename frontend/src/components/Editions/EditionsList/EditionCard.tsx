import { useNavigate } from "react-router-dom";
import { Styles } from "../../../utils/Styles";
import { pathsGenerator } from "../../../router/paths";
import { SetupButtons } from "../../Edition/Sections/SetupButtons";
import { Edition } from "../../../hooks/Editions/useEditionsScreen";

type EditionCardProps = {
  data: Edition;
  handleDeleteClick: () => void;
  handleCopyClick: () => void;
  handleEditClick: () => void;
};

export const EditionCard = ({
  data,
  handleDeleteClick,
  handleCopyClick,
  handleEditClick,
}: EditionCardProps) => {
  const navigate = useNavigate();
  const { edition, permissions } = data;

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
        permissions={permissions}
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
