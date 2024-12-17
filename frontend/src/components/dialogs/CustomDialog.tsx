import { Dialog } from "@mui/material";
import { ReactNode } from "react";
import { CustomText } from "../CustomText";
import { Styles } from "../../utils/Styles";
import { IconMapper } from "../IconMapper";
import { tokens } from "../../tokens";

const DIALOG_CONTENT_WIDTH = 500;

type CustomDialogProps = {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onCloseClick: () => void;
};

export const CustomDialog = ({
  isOpen,
  title,
  subtitle,
  children,
  onCloseClick,
}: CustomDialogProps) => {
  return (
    <Dialog open={isOpen} maxWidth="lg">
      <div style={formStyles.headerContainer}>
        <div>
          <CustomText style={formStyles.title}>{title}</CustomText>
          <CustomText>{subtitle}</CustomText>
        </div>
        <IconMapper
          icon="close"
          onClick={onCloseClick}
          size={28}
          color={tokens.color.text.tertiary}
        />
      </div>

      {children}
    </Dialog>
  );
};

export const formStyles: Styles = {
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    paddingBottom: 6,
  },
  title: {
    fontWeight: "bold",
    color: tokens.color.text.primary,
    fontSize: tokens.font.title,
  },
  formContainer: {
    width: DIALOG_CONTENT_WIDTH,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  fieldsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};
