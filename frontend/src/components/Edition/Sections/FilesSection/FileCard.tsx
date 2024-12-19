import { getCardStyles } from "../../../../utils/utils";
import { Avatar } from "../../../avatars/Avatar";
import { SetupButtons } from "../SetupButtons";
import { FileItem } from "./FilesSection";

export type FileCardProps = {
  item: FileItem;
  handleDelete: () => void;
};

export const FileCard = ({ item, handleDelete }: FileCardProps) => {
  return (
    <div style={getCardStyles(false)}>
      <Avatar id={item.id} size="l" />
      <SetupButtons
        permissions={item.permissions}
        handleDelete={handleDelete}
      />
    </div>
  );
};
