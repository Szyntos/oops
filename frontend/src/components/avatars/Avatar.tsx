import { CSSProperties } from "react";
import { FETCH_FILES_URL } from "../../utils/constants";
import { Styles } from "../../utils/Styles";
import { tokens } from "../../tokens";

export type AvatarProps = {
  id: string | undefined;
  size: AvatarSize;
  disabled?: boolean;
  shadow?: AvatarShadowSize;
  imageStyle?: CSSProperties;
};

export type AvatarShadowSize = "none" | "small" | "big";

const sizeMap: Record<AvatarSize, number> = {
  xs: 48,
  s: 64,
  m: 82,
  l: 120,
};

export type AvatarSize = "xs" | "s" | "m" | "l";

export const Avatar = ({
  size,
  id,
  disabled,
  shadow = "none",
  imageStyle,
}: AvatarProps) => {
  return (
    <div
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
      }}
    >
      <img
        src={`${FETCH_FILES_URL}${id}`}
        alt={`img id ${id}`}
        style={{
          ...styles.img,
          boxShadow:
            shadow !== "none"
              ? `0px 0px ${shadow === "small" ? 6 : 16}px ${shadow === "small" ? tokens.color.shadow.white : tokens.color.shadow.accent}`
              : undefined,
          ...imageStyle,
          ...{
            width: sizeMap[size],
            height: sizeMap[size],
            opacity: disabled ? 0.1 : 1,
          },
        }}
      />
    </div>
  );
};

const styles: Styles = {
  img: {
    width: "100%",
    // TODO this probably should be adjusted to img size
    borderRadius: 12,
    objectFit: "cover",
  },
};
