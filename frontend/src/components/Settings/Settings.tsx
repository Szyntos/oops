import { Edition } from "../../contexts/userContext";
import { useEditionSelection } from "../../hooks/common/useEditionSelection";
import { Styles } from "../../utils/Styles";
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
    <div style={styles.container}>
      <ChangeEditionForm
        handleConfirm={handleChangeEditionConfirm}
        editions={editions}
        initialValues={
          selectedEdition ? { editionId: selectedEdition.editionId } : undefined
        }
      />
    </div>
  );
};

const styles: Styles = {
  container: {
    padding: 20,
    paddingTop: 60,
    width: 300,
  },
};
