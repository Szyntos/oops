import { FormHelperText } from "@mui/material";
import { Styles } from "../../utils/Styles";
import { AwardImage } from "../images/AwardImage";

type MultipleImageSelectProps = {
  options: Option[];
  selectedIds: string[];
  onSelectClick: (updatedIds: string[]) => void;
  error: string | undefined;
  touched?: boolean;
};

type Option = {
  id: string;
  value: string;
};

export const MultipleImageSelect = ({
  options,
  selectedIds,
  onSelectClick,
  error,
  touched,
}: MultipleImageSelectProps) => {
  const handleSelect = (option: Option) => {
    const updatedIds: string[] = selectedIds.some((id) => id === option.id)
      ? selectedIds.filter((id) => id !== option.id)
      : [...selectedIds, option.id];

    onSelectClick(updatedIds);
  };
  return (
    <div style={styles.container}>
      <div style={styles.listContainer}>
        {options.map((option) => (
          <div style={styles.imageWrapper} onClick={() => handleSelect(option)}>
            <AwardImage
              id={option.value}
              size={"l"}
              disabled={!selectedIds.some((id) => id === option.id)}
            />
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
