import { FormHelperText } from "@mui/material";
import { Styles } from "../../utils/Styles";
import { AwardImage } from "../images/AwardImage";

type SelectImageProps = {
  ids: string[];
  selectedId: string | undefined;
  onSelectClick: (id: string) => void;
  error: string | undefined;
  touched?: boolean;
};

export const SelectImage = ({
  ids,
  selectedId,
  onSelectClick,
  error,
  touched,
}: SelectImageProps) => {
  return (
    <div style={styles.container}>
      <div style={styles.listContainer}>
        {ids.map((id) => (
          <div style={styles.imageWrapper} onClick={() => onSelectClick(id)}>
            <AwardImage id={id} size={"l"} disabled={selectedId !== id} />
          </div>
        ))}
      </div>
      {error && touched && (
        <FormHelperText style={{ color: "red" }}>{error}</FormHelperText>
      )}
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  listContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  imageWrapper: {
    cursor: "pointer",
  },
};
