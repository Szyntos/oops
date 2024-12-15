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
    <div>
      {subcategories.map((row, index) => (
        <SubcategoryRow
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
      <SubcategoryRow
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
  );
};
