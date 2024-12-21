import { Styles } from "../../../../utils/Styles";
import { CustomText } from "../../../CustomText";
import { Icon, IconMapper } from "../../../IconMapper";

export type ItemWithIconProps = {
  icon?: Icon;
  title: string | number;
};

export const ItemWithIcon = ({ icon, title }: ItemWithIconProps) => {
  return (
    <div style={styles.container}>
      {icon && <IconMapper icon={icon} />}
      <CustomText>{title}</CustomText>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
};
