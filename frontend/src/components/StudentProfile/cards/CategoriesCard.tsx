import { ProgressBar, ProgressBarProps } from "../../bars/ProgressBar";
import { Section } from "./Card/Section";

type CategoriesCardProps = {
  categoriesBarProps: ProgressBarProps[];
};

export const CategoriesCard = ({ categoriesBarProps }: CategoriesCardProps) => {
  return (
    <Section title="Kategorie">
      {categoriesBarProps.map((props, index) => (
        <ProgressBar key={index} {...props} showPoints />
      ))}
    </Section>
  );
};
