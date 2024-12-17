import { ReactElement } from "react";
import { Styles } from "../../utils/Styles";
import { Section } from "../StudentProfile/cards/Section/Section";
import { CustomText } from "../CustomText";

type CardsSectionProps = {
  title: string;
  cards: ReactElement[];
};

export const CardsSection = ({ title, cards }: CardsSectionProps) => {
  return (
    <Section title={title}>
      <div style={styles.container}>
        {cards.length > 0 ? cards : <CustomText>EMPTY_FIELD_STRING</CustomText>}
      </div>
    </Section>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
};
