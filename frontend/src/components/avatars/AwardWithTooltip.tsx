import { TooltipWrapper } from "../TooltipWrapper";
import { dateOptions } from "../../utils/constants";
import { Styles } from "../../utils/Styles";
import { Avatar, AvatarSize } from "./Avatar";
import { AwardTypeType } from "../../__generated__/schema.graphql.types";
import { getAwardMaxUsageString, getAwardValueString } from "../../utils/utils";

type AwardWithTooltipProps = {
  props: AwardTooltipProps;
  size: AvatarSize;
};

export type AwardTooltipProps = {
  id: string;
  updatedAt?: string;
  createdAt?: string;
  name: string;
  description: string;
  value?: number;
  imageId: string | undefined;
  maxUsage?: number;
  typeValue?: number;
  type?: AwardTypeType;
};

export const AwardWithTooltip = ({ props, size }: AwardWithTooltipProps) => {
  const {
    updatedAt,
    createdAt,
    name,
    description,
    value,
    imageId,
    maxUsage,
    typeValue,
    type,
  } = props;

  const displayDate =
    updatedAt || createdAt
      ? new Date(updatedAt ?? (createdAt as string))
      : undefined;

  return (
    <TooltipWrapper
      tooltipContent={
        <div style={styles.container}>
          <div style={styles.title}>{name}</div>
          {type && <div>{type}</div>}
          {maxUsage && <div>{getAwardMaxUsageString(maxUsage)}</div>}
          {typeValue && type && (
            <div>{getAwardValueString(type, typeValue)}</div>
          )}
          <div>{description}</div>
          {value && <div>Punkty: {value.toFixed(2)}</div>}
          {displayDate && (
            <div>{displayDate.toLocaleDateString("pl-PL", dateOptions)}</div>
          )}
        </div>
      }
    >
      <Avatar id={imageId} size={size} />
    </TooltipWrapper>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    fontWeight: "bold",
  },
};
