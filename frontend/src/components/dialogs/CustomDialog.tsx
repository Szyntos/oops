import { Dialog } from "@mui/material";
import { ReactNode } from "react";
import { CustomText } from "../CustomText";
import { IconMapper } from "../IconMapper";
import { tokens } from "../../tokens";
import { formStyles } from "../../utils/utils";

type CustomDialogProps = {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  onCloseClick: () => void;
  size?: "md" | "lg";
};

const MD_DIALOG_WIDTH = 500;
const LG_DIALOG_WIDTH = 800;

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
          ...formStyles.headerContainer,
          width: size === "md" ? MD_DIALOG_WIDTH : LG_DIALOG_WIDTH,
        }}
      >
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
