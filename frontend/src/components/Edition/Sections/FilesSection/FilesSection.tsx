import { useEffect, useState, useRef } from "react";
import { useFilesLazyQuery } from "../../../../graphql/files.graphql.types";
import { Styles } from "../../../../utils/Styles";
import { useParams } from "react-router-dom";
import { Folder, FolderNavbar } from "./FolderNavbar/FolderNavbar";
import { ImagesList } from "./ImagesList/ImagesList";
import { useError } from "../../../../hooks/common/useGlobalError";
import { UPLOAD_FILES_URL } from "../../../../utils/constants";

const folders: Folder[] = [
  { title: "award", pathPrefix: `image/award` },
  { title: "chest", pathPrefix: `image/chest` },
  { title: "group", pathPrefix: `image/group` },
  { title: "level", pathPrefix: `image/level` },
  { title: "users", pathPrefix: `image/user` },
];

export const FilesSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const { globalErrorWrapper } = useError();

  const [activeFolder, setActiveFolder] = useState<Folder>(folders[0]);
  const [fetchFiles, { loading, error, data, refetch }] = useFilesLazyQuery();

  const imagesIds: string[] =
    data?.getFilesGroupedByTypeBySelectedTypes.flatMap((a) =>
      a.files.map((f) => f.fileId),
    ) ?? [];

  useEffect(() => {
    fetchFiles({ variables: { paths: [activeFolder.pathPrefix] } });
  }, [activeFolder, fetchFiles, editionId]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("fileType", activeFolder.pathPrefix);

      globalErrorWrapper(async () => {
        const res = await fetch(UPLOAD_FILES_URL, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error(`Error: ${res.statusText}`);
        await refetch();
        event.target.value = "";
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.container}>
      <FolderNavbar
        folders={folders}
        active={activeFolder}
        setActive={setActiveFolder}
      />
      <button onClick={handleUploadClick}>Upload file</button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <ImagesList
        imageIds={imagesIds}
        title={`All ${activeFolder.title} files`}
      />
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};
