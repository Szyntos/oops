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
        <>
          <CustomText
            style={styles.title}
            size={bigTitle ? tokens.font.header : tokens.font.title}
          >
            {title}
          </CustomText>
          <div style={styles.separator} />
        </>
      )}
      <div style={styles.contentContainer}>{children}</div>
    </div>
  );
};

const styles: Styles = {
  separator: {
    height: 1,
    backgroundColor: tokens.color.border.light,
    opacity: 0.3,
    marginTop: 6,
    marginBottom: 16,
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};
