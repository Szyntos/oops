import { ReactNode } from "react";
import { Styles } from "../../../../utils/Styles";
import { CustomText } from "../../../CustomText";
import { tokens } from "../../../../tokens";

type SectionProps = {
  title?: string;
  children: ReactNode;
};

export const Section = ({ title, children }: SectionProps) => {
  return (
    <div>
      {title && (
        <div style={styles.sep}>
          <CustomText
            color={tokens.color.text.secondary}
            bold={true}
            size={tokens.font.text}
          >
            {title.toUpperCase()}
          </CustomText>
          <div style={styles.separator} />
        </div>
      )}
      <div style={styles.contentContainer}>{children}</div>
    </div>
  );
};

const styles: Styles = {
  separator: {
    height: 1,
    backgroundColor: tokens.color.text.secondary,
    flex: 1,
  },
  sep: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
};
