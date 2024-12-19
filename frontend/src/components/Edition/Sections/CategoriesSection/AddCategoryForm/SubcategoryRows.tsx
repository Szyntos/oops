import { formStyles } from "../../../../../utils/utils";
import { SubcategoriesFormValues, SubcategoryRow } from "./SubcategoryRow";

type SubcategoryRowsProps = {
  subcategories: FormSubcategory[];
  handleAdd: (subcategory: SubcategoriesFormValues) => void;
  handleDelete: (ordinal: number) => void;
  handleUp: (ordinal: number) => void;
  handleDown: (ordinal: number) => void;
};

export type FormSubcategory = {
  name: string;
  max: number;
};

export const SubcategoryRows = ({
  subcategories,
  handleAdd,
  handleDelete,
  handleUp,
  handleDown,
}: SubcategoryRowsProps) => {
  return (
    <div style={formStyles.fieldsContainer}>
      {subcategories.map((row, index) => (
        <SubcategoryRow
          variant="edit"
          key={index + row.name}
          initialValues={{
            name: row.name,
            maxPoints: row.max,
            ordinal: index + 1,
          }}
          blockDown={index === subcategories.length - 1}
          blockUp={index === 0}
          handleAdd={handleAdd}
          handleDelete={handleDelete}
          handleUp={handleUp}
          handleDown={handleDown}
        />
      ))}
      <div style={{ paddingTop: 6 }}>
        <SubcategoryRow
          variant="add"
          initialValues={{
            name: "",
            maxPoints: 0,
            ordinal: subcategories.length + 1,
          }}
          handleAdd={handleAdd}
          handleDelete={handleDelete}
          handleUp={() => {}}
          handleDown={() => {}}
        />
      </div>
    </div>
  );
};
