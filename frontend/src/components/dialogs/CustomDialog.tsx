import { Dialog } from "@mui/material";
import { ReactNode } from "react";
import { CustomText } from "../CustomText";
import { IconMapper } from "../IconMapper";
import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";

type CustomDialogProps = {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onCloseClick: () => void;
  size?: "md" | "lg";
};

export const MD_DIALOG_WIDTH = 500;
export const LG_DIALOG_WIDTH = 800;

export const CustomDialog = ({
  isOpen,
  title,
  subtitle,
  children,
  onCloseClick,
  size = "md",
}: CustomDialogProps) => {
  return (
    <Dialog open={isOpen} maxWidth="lg">
      <div
        style={{
          ...styles.headerContainer,
          width: size === "md" ? MD_DIALOG_WIDTH : LG_DIALOG_WIDTH,
        }}
      >
        <div style={styles.textContainer}>
          <CustomText style={styles.title}>{title}</CustomText>
          {subtitle && <CustomText>{subtitle}</CustomText>}
        </div>
        <IconMapper
          icon="close"
          onClick={onCloseClick}
          size={28}
          color={tokens.color.text.tertiary}
        />
      </div>

      <div
        style={{
          width: size === "md" ? MD_DIALOG_WIDTH : LG_DIALOG_WIDTH,
          padding: 12,
        }}
      >
        {children}
      </div>
    </Dialog>
  );
};

const styles: Styles = {
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    color: tokens.color.text.primary,
    fontSize: tokens.font.title,
  },
};
