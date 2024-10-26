import { useParams } from "react-router-dom";

export const ChestsSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  return <div>chests section {editionId}</div>;
};
