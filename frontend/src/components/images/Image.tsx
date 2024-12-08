import { CSSProperties } from "react";
import { FETCH_FILES_URL } from "../../utils/constants";
import { Styles } from "../../utils/Styles";

export type CustomImageProps = {
  id: string | undefined;
  size: ImageSize;
  disabled: boolean;
  shadow?: boolean;
  imageStyle?: CSSProperties;
};

const sizeMap: Record<ImageSize, number> = {
  xs: 48,
  s: 64,
  m: 82,
  l: 120,
};

export type ImageSize = "xs" | "s" | "m" | "l";

export const CustomImage = ({
  size,
  id,
  disabled,
  shadow,
  imageStyle,
}: CustomImageProps) => {
  return (
    <div
      style={{
        width: sizeMap[size],
        height: size,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <img
        src={`${FETCH_FILES_URL}${id}`}
        alt={`img id ${id}`}
        style={{
          ...styles.img,
          boxShadow: shadow
            ? "0px 0px 6px rgba(255, 255, 255, 0.6)"
            : undefined,
          ...imageStyle,
        }}
      />
    </div>
  );
};

const styles: Styles = {
  img: {
    width: "100%",
    objectFit: "cover",
    borderRadius: 12,
  },
};
