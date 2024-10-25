import { useParams } from "react-router-dom";

export const GroupsSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  return <div>groups section {editionId}</div>;
};
