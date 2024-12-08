import { ReactNode } from "react";
import { Styles } from "../../../../utils/Styles";
import { CustomText } from "../../../CustomText";
import { tokens } from "../../../../tokens";

type SectionProps = {
  title?: string;
  children: ReactNode;
  bigTitle?: boolean;
};

export const Section = ({ title, children, bigTitle }: SectionProps) => {
  return (
    <div>
      {title && (
        <div style={styles.sep}>
          <CustomText
            style={styles.title}
            size={bigTitle ? tokens.font.header : tokens.font.title}
            color={tokens.color.accent.dark}
            bold={true}
          >
            {title}
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
    backgroundColor: tokens.color.accent.dark,
    flex: 1,
  },
  sep: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
};
