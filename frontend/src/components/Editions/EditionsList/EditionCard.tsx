import { useNavigate } from "react-router-dom";
import { pathsGenerator } from "../../../router/paths";
import { SetupButtons } from "../../Edition/Sections/SetupButtons";
import { Edition } from "../../../hooks/Editions/useEditionsScreen";
import { coordinatorStyles, getCardStyles } from "../../../utils/utils";
import { CustomText } from "../../CustomText";

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
    <div style={getCardStyles(true)} key={edition.editionId}>
      <div style={coordinatorStyles.textContainer}>
        <CustomText style={coordinatorStyles.title}>
          {edition.editionName}
        </CustomText>
        <CustomText>
          {`${edition.startDate.slice(0, 4)}/${edition.endDate.slice(0, 4)}`}
        </CustomText>
      </div>

      <SetupButtons
        handleDelete={handleDeleteClick}
        handleCopy={handleCopyClick}
        handleEdit={handleEditClick}
        handleShow={() =>
          navigate(pathsGenerator.coordinator.Edition(edition.editionId))
        }
        permissions={permissions}
      />
    </div>
  );
};
