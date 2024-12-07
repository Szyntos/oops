import { CourseProgressBar } from "../../bars/CourseProgressBar";
import { ProgressBar, ProgressBarProps } from "../../bars/ProgressBar";
import { Section } from "./Card/Section";

type CategoriesCardProps = {
  categoriesBarProps: ProgressBarProps[];
  totalPoints: number;
};

export const CategoriesCard = ({
  categoriesBarProps,
  totalPoints,
}: CategoriesCardProps) => {
  return (
    <Section title="Punkty">
      {categoriesBarProps.map((props, index) => (
        <ProgressBar key={index} {...props} showPoints />
      ))}
      <CourseProgressBar totalPoints={totalPoints} title="razem" />
    </Section>
  );
};
