import { CustomSideBar } from "../../layout/CustomSideBar";
import {
  FilterOptionsSection,
  FilterOptionsSectionProps,
} from "./FilterOptionsSection";

type SideFilterBarProps = {
  sections: FilterOptionsSectionProps[];
};

export const SideFilterBar = ({ sections }: SideFilterBarProps) => {
  return (
    <CustomSideBar>
      {sections.map((props) => (
        <FilterOptionsSection {...props} />
      ))}
    </CustomSideBar>
  );
};
