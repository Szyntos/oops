import { useParams } from "react-router-dom";

export const LevelsSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  return <div>levels section {editionId}</div>;
};
