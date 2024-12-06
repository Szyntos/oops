import { Styles } from "../../../../utils/Styles";
import { CustomText } from "../../../CustomText";
import { Icon, IconMapper } from "../../../IconMapper";

export type CardItemProps = {
  icon: Icon;
  title: string | number;
};

export const CardItem = ({ icon, title }: CardItemProps) => {
  return (
    <div style={styles.container}>
      <IconMapper icon={icon} />
      <CustomText>{title}</CustomText>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
};
