import { Edition } from "../../hooks/Editions/useEditionScreen";
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
  return (
    <div style={styles.container}>
      <ChangeEditionForm
        handleConfirm={handleChangeEditionConfirm}
        editions={editions}
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
