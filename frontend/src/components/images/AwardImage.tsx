import { Image } from "./Image";

type AwardImageProps = {
  id: string | undefined;
  size: AwardImageSize;
  disabled?: boolean;
};

const sizeMap: Record<AwardImageSize, number> = {
  s: 32,
  m: 48,
  l: 80,
};

export type AwardImageSize = "s" | "m" | "l";

export const AwardImage = ({ id, size, disabled = false }: AwardImageProps) => {
  return <Image id={id} size={sizeMap[size]} disabled={disabled} />;
};
