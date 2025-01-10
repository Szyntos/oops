import { tokens } from "../../../tokens";
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
          <CustomText>Status wyklucia:</CustomText>
          <IconMapper
            icon={levelCheck ? "yes" : "no"}
            color={
              levelCheck ? tokens.color.state.success : tokens.color.state.error
            }
          />
        </div>

        <div style={styles.checkRow}>
          <CustomText>Status projektu:</CustomText>
          <IconMapper
            icon={projectCheck ? "yes" : "no"}
            color={
              projectCheck
                ? tokens.color.state.success
                : tokens.color.state.error
            }
          />
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
