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

  return (
    <ChangeEditionForm
      handleConfirm={handleChangeEditionConfirm}
      editions={editions}
      initialValues={
        selectedEdition ? { editionId: selectedEdition.editionId } : undefined
      }
    />
  );
};
