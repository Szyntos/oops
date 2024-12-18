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
