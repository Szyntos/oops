import { CourseProgressBar } from "../../bars/CourseProgressBar";
import { ProgressBar, ProgressBarProps } from "../../bars/ProgressBar";
import { Section } from "./Section/Section";

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
      <div>
        <CourseProgressBar totalPoints={totalPoints} title="razem" />
      </div>

      {categoriesBarProps.map((props, index) => (
        <ProgressBar key={index} {...props} showPoints />
      ))}
    </Section>
  );
};
