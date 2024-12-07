import { Image, ImageSize } from "./Image";

type AwardImageProps = {
  id: string | undefined;
  size: ImageSize;
  disabled?: boolean;
};

export const AwardImage = ({ id, size, disabled = false }: AwardImageProps) => {
  return <Image id={id} size={size} disabled={disabled} />;
};
