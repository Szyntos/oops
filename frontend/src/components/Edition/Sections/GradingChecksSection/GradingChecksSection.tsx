import { Styles } from "../../../../utils/Styles";

import { useParams } from "react-router-dom";

export const GradingChecksSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  return (
    <div style={styles.container}>
      <div>grading checks: {editionId}</div>
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
