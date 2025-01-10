import { Edition } from "../../contexts/userContext";
import { useEditionSelection } from "../../hooks/common/useEditionSelection";
import { ChangeEditionForm } from "./ChangeEditionForm";

type SettingsProps = {
  editions: Edition[];
  handleChangeEditionConfirm: (editionId: string) => void;
};
export const Settings = ({
  editions,
  handleChangeEditionConfirm,
}: SettingsProps) => {
  const { selectedEdition } = useEditionSelection();
  const sortedEditions = editions
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <ChangeEditionForm
      handleConfirm={handleChangeEditionConfirm}
      editions={sortedEditions}
      initialValues={
        selectedEdition ? { editionId: selectedEdition.editionId } : undefined
      }
    />
  );
};
