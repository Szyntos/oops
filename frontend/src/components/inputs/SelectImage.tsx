import { Styles } from "../../utils/Styles";
import { Avatar } from "../avatars/Avatar";
import { Award } from "../../hooks/Edition/useAwardsSection";
import { TooltipWrapper } from "../TooltipWrapper";
import { CustomText } from "../CustomText";
import { tokens } from "../../tokens";
import { FormError } from "../form/FormError";

type SelectImageProps = {
  selectedIds: string[];
  onSelectClick: (updatedIds: string[]) => void;
  error: string | undefined;
  touched: boolean | undefined;
  selectVariant: "multiple" | "single";
  title: string;
} & (AwardProps | WithoutTooltip);

type AwardProps = {
  type: "award";
  options: Award[];
};

type WithoutTooltip = {
  type: "withoutTooltip";
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
              <Avatar
                id={award.award.imageFile?.fileId}
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
            <Avatar
              id={imageId}
              size="s"
              disabled={!selectedIds.some((id) => id === imageId)}
            />
          </div>
        ));
    }
  };

  return (
    <div style={styles.container}>
      <CustomText color={tokens.color.text.tertiary} style={styles.label}>
        {title}
      </CustomText>
      <div style={styles.listContainer}>{getOptionsImagesBasedOnType()}</div>
      {error && touched && <FormError error={error} />}
    </div>
  );
};

const styles: Styles = {
  label: {
    color: tokens.color.text.tertiary,
    paddingLeft: 12,
    fontSize: 13,
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingTop: 4,
  },
  listContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  imageWrapper: {
    cursor: "pointer",
  },
  title: {
    fontWeight: "bold",
  },
};
