import { useParams } from "react-router-dom";

export const AwardsSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  return <div>awards section {editionId}</div>;
};
