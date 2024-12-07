import { ReactNode } from "react";
import { Styles } from "../../../../utils/Styles";
import { CustomText } from "../../../CustomText";
import { tokens } from "../../../../tokens";

const TITLE_MARGIN = 8;
const CONTENT_MARGIN = 12;

type SectionProps = {
  title?: string;
  children: ReactNode;
};

export const Section = ({ title, children }: SectionProps) => {
  return (
    <div>
      {title && (
        <>
          <CustomText style={styles.title} size={tokens.font.l}>
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
  title: {
    paddingLeft: TITLE_MARGIN,
  },
  separator: {
    height: 2,
    backgroundColor: tokens.color.border.light,
    marginTop: TITLE_MARGIN,
    marginBottom: CONTENT_MARGIN,
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};
