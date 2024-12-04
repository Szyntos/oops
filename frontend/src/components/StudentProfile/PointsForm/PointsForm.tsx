import { useFormik } from "formik";
import { ZodError, z } from "zod";
import { useState } from "react";
import { FormPoints } from "./types";
import { Styles } from "../../../utils/Styles";
import { NumberInput } from "../../inputs/NumberInput";
import { SelectInput } from "../../inputs/SelectInput";
import { Category } from "../../../utils/utils";

export type PointsFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  categoryId: z.string().min(1, "Wymagane"),
  subcategoryId: z.string().min(1, "Wymagane"),
  points: z.number().min(0, "Minimalna liczba punktów to 0"),
});

type PointFormProps = {
  categories: Category[];
  handleConfirmClick: (formPoints: FormPoints) => void;
  mutationError?: string;
  initialValues: PointsFormValues;
  variant: "add" | "edit";
  disableCategoryAndSubcategory?: boolean;
};

export const PointsForm = ({
  categories,
  handleConfirmClick,
  mutationError,
  initialValues,
  variant,
  disableCategoryAndSubcategory,
}: PointFormProps) => {
  console.log("POCZĄTKOWE WARTOŚCI: ", initialValues);
  const formik = useFormik({
    initialValues,
    validate: (values: PointsFormValues) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors: any = {};

      // schema validation
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }

      // custom validation
      const selectedCategory = categories.find(
        (cat) => cat.id === values.categoryId,
      );
      const selectedSubcategory = selectedCategory?.subcategories.find(
        (sub) => sub.id === values.subcategoryId,
      );

      if (
        selectedSubcategory &&
        values.points > selectedSubcategory.maxPoints
      ) {
        errors.points = `Max to ${selectedSubcategory.maxPoints}`;
      }

      return errors;
    },
    onSubmit: (values: PointsFormValues) => {
      const points: FormPoints = {
        points: values.points,
        subcategoryId: values.subcategoryId,
      };
      handleConfirmClick(points);
    },
  });

  const [subcategories, setSubcategories] = useState(
    categories.find((c) => c.id === initialValues.categoryId)?.subcategories,
  );

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    // TODO probably it should be handled somehow in the future
    const updatedSubcategories =
      categories.find((category) => category.id === categoryId)
        ?.subcategories ?? [];
    setSubcategories(updatedSubcategories);

    formik.setFieldValue("Id kategorii", categoryId);
    formik.setFieldValue("id subkategorii", updatedSubcategories[0]?.id ?? "");
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>
        {variant === "edit" ? "Edytuj punkty" : "Dodaj punkty"}
      </div>
      <form onSubmit={formik.handleSubmit}>
        <SelectInput
          handleChange={handleCategoryChange}
          handleBlur={formik.handleBlur}
          value={formik.values.categoryId}
          error={formik.errors.categoryId}
          touched={formik.touched.categoryId}
          name="categoryId"
          optionItems={categories?.map((category) => ({
            value: category.id,
            title: category.name,
          }))}
          label="Kategoria"
          disabled={disableCategoryAndSubcategory}
        />
        <SelectInput
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
          value={formik.values.subcategoryId}
          error={formik.errors.subcategoryId}
          touched={formik.touched.subcategoryId}
          name="subcategoryId"
          optionItems={subcategories?.map((subcategory) => ({
            value: subcategory.id,
            title: subcategory.name,
          }))}
          label="Subkategoria"
          disabled={disableCategoryAndSubcategory}
        />
        <NumberInput
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
          value={formik.values.points}
          error={formik.errors.points}
          touched={formik.touched.points}
          name="points"
          label="Punkty"
        />
        <button type="submit">Potwierdź</button>
      </form>
      {mutationError && <p style={styles.error}>Error: {mutationError}</p>}
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 12,
    border: "1px solid black",
    width: 500,
  },
  title: {
    fontWeight: "bold",
  },
  error: {
    color: "red",
  },
};
