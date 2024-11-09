import { FormHelperText } from "@mui/material";
import { Styles } from "../../../../../utils/Styles";
import { AwardImage } from "../../../../images/AwardImage";
import { Award } from "../../../../../hooks/Edition/useAwardsSection";
import { TooltipWrapper } from "../../../../TooltipWrapper";

type MultipleAwardSelectProps = {
  awards: Award[];
  selectedIds: string[];
  onSelectClick: (updatedIds: string[]) => void;
  error: string | undefined;
  touched?: boolean;
};

export const MultipleAwardSelect = ({
  awards,
  selectedIds,
  onSelectClick,
  error,
  touched,
}: MultipleAwardSelectProps) => {
  const handleSelect = (award: Award) => {
    const updatedIds: string[] = selectedIds.some((id) => id === award.awardId)
      ? selectedIds.filter((id) => id !== award.awardId)
      : [...selectedIds, award.awardId];
    onSelectClick(updatedIds);
  };
  return (
    <div style={styles.container}>
      <div style={styles.listContainer}>
        {awards.map((award) => (
          <div style={styles.imageWrapper} onClick={() => handleSelect(award)}>
            <TooltipWrapper
              tooltipContent={
                <div style={styles.container}>
                  <div style={styles.title}>{award.awardName}</div>
                  <div>{award.description}</div>
                </div>
              }
            >
              <AwardImage
                id={award.imageFileId as string}
                size={"l"}
                disabled={!selectedIds.some((id) => id === award.awardId)}
              />
            </TooltipWrapper>
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
  title: {
    fontWeight: "bold",
  },
};
