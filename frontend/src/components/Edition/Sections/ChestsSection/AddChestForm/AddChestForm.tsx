import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import { Styles } from "../../../../../utils/Styles";
import { TextField } from "@mui/material";
import { Award } from "../../../../../hooks/Edition/useAwardsSection";
import { SelectImage } from "../../../../inputs/SelectImage";
import { tokens } from "../../../../../tokens";

const ValidationSchema = z.object({
  awardBundleCount: z.number().min(0),
  fileId: z.string(),
  name: z.string().min(1),
  awardThisEditionIds: z.array(z.string()),
  awardNotThisEditionIds: z.array(z.string()),
});

export type ChestFormValues = z.infer<typeof ValidationSchema>;

type AddChestFormProps = {
  handleConfirm: (values: ChestFormValues) => void;
  formError?: string;
  initialValues?: ChestFormValues;
  awardsThisEdition: Award[];
  awardsNotThisEdition: Award[];
  title: string;
  imageIds: string[];
};

const defaultInitialValues: ChestFormValues = {
  awardBundleCount: 1,
  fileId: "",
  name: "",
  awardThisEditionIds: [],
  awardNotThisEditionIds: [],
};

export const AddChestForm = ({
  handleConfirm,
  imageIds,
  formError,
  awardsThisEdition = [],
  awardsNotThisEdition = [],
  initialValues = defaultInitialValues,
  title,
}: AddChestFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: ChestFormValues) => {
      const errors: FormikErrors<ChestFormValues> = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }

      if (values.fileId === "") {
        errors.fileId = "Wybierz plik";
      }

      if (values.awardThisEditionIds.length === 0) {
        errors.awardThisEditionIds = "Wybierz co najmniej jedną nagrodę";
      }

      if (values.awardThisEditionIds.length < values.awardBundleCount) {
        errors.awardThisEditionIds =
          "Liczba wybranych nagród  edycji nie może być mniejsza niż maksymalna liczba nagród do wyboru ze skrzynki";
      }

      return errors;
    },
    onSubmit: (values: ChestFormValues) => {
      handleConfirm(values);
    },
  });

  return (
    <div style={styles.container}>
      <div style={styles.title}>{title}</div>
      <form onSubmit={formik.handleSubmit}>
        <div style={styles.fieldsContainer}>
          <TextField
            fullWidth
            name="maxUsages"
            label="Maksymalna liczba nagród do wyboru ze skrzynki"
            variant="outlined"
            type="number"
            value={formik.values.awardBundleCount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(
              formik.touched.awardBundleCount && formik.errors.awardBundleCount,
            )}
            helperText={
              formik.touched.awardBundleCount && formik.errors.awardBundleCount
            }
          />
          <TextField
            fullWidth
            name="name"
            label="Nazwa"
            variant="outlined"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />

          <SelectImage
            type="withoutTooltip"
            options={imageIds}
            selectedIds={[formik.values.fileId.toString()]}
            onSelectClick={(updatedIds: string[]) =>
              formik.setValues({
                ...formik.values,
                fileId: updatedIds.length > 0 ? updatedIds[0] : "",
              })
            }
            error={formik.errors.fileId as string}
            touched={formik.touched.fileId}
            selectVariant={"single"}
            title="Wybierz ikonę:"
          />

          <SelectImage
            type="award"
            options={awardsThisEdition}
            selectedIds={formik.values.awardThisEditionIds}
            onSelectClick={(updatedIds: string[]) =>
              formik.setValues({
                ...formik.values,
                awardThisEditionIds: updatedIds,
              })
            }
            error={formik.errors.awardThisEditionIds as string}
            touched={formik.touched.awardThisEditionIds}
            selectVariant={"multiple"}
            title={"Wybrane nagrody z tej edycji:"}
          />

          <SelectImage
            type="award"
            options={awardsNotThisEdition}
            selectedIds={formik.values.awardNotThisEditionIds}
            onSelectClick={(updatedIds: string[]) =>
              formik.setValues({
                ...formik.values,
                awardNotThisEditionIds: updatedIds,
              })
            }
            error={undefined}
            touched={undefined}
            selectVariant={"multiple"}
            title={"Wybrane nagrody z innych edycji:"}
          />
        </div>
        <button type="submit">Potwierdź</button>
      </form>
      {formError && <p style={styles.error}>Error: {formError}</p>}
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 12,
    width: 500,
  },
  title: {
    fontWeight: "bold",
  },
  error: {
    color: tokens.color.state.error,
  },
  fieldsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};
