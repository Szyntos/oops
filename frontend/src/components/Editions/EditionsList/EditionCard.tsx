import { useNavigate } from "react-router-dom";
import { pathsGenerator } from "../../../router/paths";
import { SetupButtons } from "../../Edition/Sections/SetupButtons";
import { Edition } from "../../../hooks/Editions/useEditionsScreen";
import {
  coordinatorStyles,
  getCardStyles,
  getTimestamp,
  isEditionActive,
} from "../../../utils/utils";
import { CustomText } from "../../CustomText";
import { tokens } from "../../../tokens";

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
        <div style={coordinatorStyles.textContainer}>
          <CustomText>
            {getTimestamp(edition.startDate, edition.endDate)}
          </CustomText>
          <CustomText
            color={
              isEditionActive(edition.startDate, edition.endDate)
                ? tokens.color.accent.light
                : undefined
            }
          >
            {isEditionActive(edition.startDate, edition.endDate)
              ? "aktywna"
              : "nieaktywna"}
          </CustomText>
        </div>
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
