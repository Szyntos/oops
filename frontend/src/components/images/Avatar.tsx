import { Image, ImageSize } from "./Image";

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
  return <Image id={id} size={size} disabled={disabled} shadow={shadow} />;
};
