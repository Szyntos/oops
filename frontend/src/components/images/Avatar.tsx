import { CustomImage, ImageSize } from "./CustomImage";

type AvatarProps = {
  id: string | undefined;
  size: ImageSize;
  disabled?: boolean;
  shadow?: boolean;
};

export const Avatar = ({
  id,
  size,
  disabled = false,
  shadow = false,
}: AvatarProps) => {
  return (
    <CustomImage id={id} size={size} disabled={disabled} shadow={shadow} />
  );
};
