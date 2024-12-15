import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Styles } from "../../utils/Styles";

type CloseHeaderProps = {
  onCloseClick: () => void;
};

export const CloseHeader = ({ onCloseClick }: CloseHeaderProps) => {
  return (
    <IconButton onClick={onCloseClick} style={styles.closeIcon}>
      <CloseIcon />
    </IconButton>
  );
};

const styles: Styles = {
  closeIcon: {
    position: "absolute",
    right: 8,
    top: 8,
  },
};
