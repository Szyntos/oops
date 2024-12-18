import { Styles } from "../../utils/Styles";
import { Avatar, AvatarSize } from "../avatars/Avatar";
import { Award } from "../../hooks/Edition/useAwardsSection";
import { TooltipWrapper } from "../TooltipWrapper";
import { CustomText } from "../CustomText";
import { FormError } from "../form/FormError";
import { EMPTY_FIELD_STRING } from "../../utils/constants";
import { formStyles } from "../../utils/utils";

type SelectImageProps = {
  selectedIds: string[];
  onSelectClick: (updatedIds: string[]) => void;
  error: string | undefined;
  touched: boolean | undefined;
  selectVariant: "multiple" | "single";
  title: string;
} & (AwardProps | WithoutTooltipProps | ChestProps);

type AwardProps = {
  type: "award";
  options: Award[];
  imageSize?: AvatarSize;
};

type WithoutTooltipProps = {
  type: "withoutTooltip";
  // ids of images
  options: string[];
  imageSize?: AvatarSize;
};

type ChestProps = {
  type: "chest";
  // ids of images
  options: string[];
  imageSize?: AvatarSize;
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
  imageSize = "s",
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
                size={imageSize}
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
              size={imageSize}
              disabled={!selectedIds.some((id) => id === imageId)}
            />
          </div>
        ));
      case "chest":
        return options.map((imageId) => (
          <div
            style={styles.imageWrapper}
            onClick={() => handleSelect(imageId)}
          >
            <Avatar
              id={imageId}
              size={imageSize}
              disabled={!selectedIds.some((id) => id === imageId)}
            />
          </div>
        ));
    }
  };

  return (
    <div style={formStyles.container}>
      <CustomText style={formStyles.label}>{title}</CustomText>
      <div style={styles.listContainer}>
        {getOptionsImagesBasedOnType().length > 0 ? (
          getOptionsImagesBasedOnType()
        ) : (
          <CustomText>{EMPTY_FIELD_STRING}</CustomText>
        )}
      </div>
      {error && touched && <FormError error={error} isFormError={false} />}
    </div>
  );
};

const styles: Styles = {
  container: {
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
