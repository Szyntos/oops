import { ProgressBar, ProgressBarProps } from "../../bars/ProgressBar";
import { Card } from "./Card/Card";

type CategoriesCardProps = {
  categoriesBarProps: ProgressBarProps[];
};

export const CategoriesCard = ({ categoriesBarProps }: CategoriesCardProps) => {
  return (
    <Card>
      {categoriesBarProps.map((props, index) => (
        <ProgressBar key={index} {...props} showPoints />
      ))}
    </Card>
  );
};
