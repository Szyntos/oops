import { FETCH_FILES_URL } from "../../utils/constants";
import { Styles } from "../../utils/Styles";

export type ImageProps = {
  id: string | undefined;
  size: ImageSize;
  disabled: boolean;
  shadow?: boolean;
};

const sizeMap: Record<ImageSize, number> = {
  xs: 48,
  s: 64,
  m: 82,
  l: 120,
};

export type ImageSize = "xs" | "s" | "m" | "l";

export const Image = ({ size, id, disabled, shadow }: ImageProps) => {
  console.log("SHADOW: ", shadow);
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
