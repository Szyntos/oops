import { CustomImage, ImageSize } from "./CustomImage";

type AwardImageProps = {
  id: string | undefined;
  size: ImageSize;
  disabled?: boolean;
};

export const AwardImage = ({ id, size, disabled = false }: AwardImageProps) => {
  return <CustomImage id={id} size={size} disabled={disabled} />;
};
