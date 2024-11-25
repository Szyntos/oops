import { FormHelperText } from "@mui/material";
import { Styles } from "../../utils/Styles";
import { AwardImage } from "../images/AwardImage";
import { Image } from "../images/Image";
import { Award } from "../../hooks/Edition/useAwardsSection";
import { TooltipWrapper } from "../TooltipWrapper";

type SelectImageProps = {
  selectedIds: string[];
  onSelectClick: (updatedIds: string[]) => void;
  error: string | undefined;
  touched: boolean | undefined;
  selectVariant: "multiple" | "single";
  title: string;
} & (AwardProps | WithoutTooltip | AvatarProps);

type AwardProps = {
  type: "award";
  options: Award[];
};

type WithoutTooltip = {
  type: "withoutTooltip";
  // ids of images
  options: string[];
};

type AvatarProps = {
  type: "avatar";
  // ids of images
  options: string[];
};

export const SelectImage = ({
  type,
  options,
  selectedIds,
  onSelectClick,
  error,
  touched,
  selectVariant,
  title,
}: SelectImageProps) => {
  const handleSelect = (selectedId: string) => {
    if (selectVariant === "single") {
      const updatedIds: string[] = selectedIds.some((id) => id === selectedId)
        ? []
        : [selectedId];
      onSelectClick(updatedIds);
    } else {
      const updatedIds: string[] = selectedIds.some((id) => id === selectedId)
        ? selectedIds.filter((id) => id !== selectedId)
        : [...selectedIds, selectedId];
      onSelectClick(updatedIds);
    }
  };

  const getOptionsImagesBasedOnType = () => {
    switch (type) {
      case "award":
        return options.map((award) => (
          <div
            style={styles.imageWrapper}
            onClick={() => handleSelect(award.award.awardId)}
          >
            <TooltipWrapper
              tooltipContent={
                <div style={styles.container}>
                  <div style={styles.title}>{award.award.awardName}</div>
                  <div>{award.award.description}</div>
                </div>
              }
            >
              <AwardImage
                id={award.award.imageFile?.fileId as string}
                size={"l"}
                disabled={!selectedIds.some((id) => id === award.award.awardId)}
              />
            </TooltipWrapper>
          </div>
        ));
      case "withoutTooltip":
        return options.map((imageId) => (
          <div
            style={styles.imageWrapper}
            onClick={() => handleSelect(imageId)}
          >
            <Image
              id={imageId}
              size={64}
              disabled={!selectedIds.some((id) => id === imageId)}
            />
          </div>
        ));
      case "avatar":
        return options.map((imageId) => (
          <div
            style={styles.imageWrapper}
            onClick={() => handleSelect(imageId)}
          >
            <Image
              id={imageId}
              size={64}
              disabled={!selectedIds.some((id) => id === imageId)}
            />
          </div>
        ));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>{title}</div>
      <div style={styles.listContainer}>{getOptionsImagesBasedOnType()}</div>
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
    gap: 8,
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
