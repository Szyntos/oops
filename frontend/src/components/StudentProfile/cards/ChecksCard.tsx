import { Styles } from "../../../utils/Styles";
import { CustomText } from "../../CustomText";
import { IconMapper } from "../../IconMapper";
import { Section } from "./Section/Section";

type ChecksCardProps = {
  levelCheck: boolean;
  projectCheck: boolean;
};

export const ChecksCard = ({ levelCheck, projectCheck }: ChecksCardProps) => {
  return (
    <Section title="Warunki zaliczenia">
      <div style={styles.checksContainer}>
        <div style={styles.checkRow}>
          <CustomText>status wyklucia:</CustomText>
          <IconMapper icon={levelCheck ? "yes" : "no"} />
        </div>

        <div style={styles.checkRow}>
          <CustomText>status projektu:</CustomText>
          <IconMapper icon={projectCheck ? "yes" : "no"} />
        </div>
      </div>
    </Section>
  );
};

const styles: Styles = {
  checksContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
  checkRow: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
};
