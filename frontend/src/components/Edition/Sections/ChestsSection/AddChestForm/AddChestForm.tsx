import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import { Styles } from "../../../../../utils/Styles";
import { TextField } from "@mui/material";
import { Award } from "../../../../../hooks/Edition/useAwardsSection";
import { SelectImage } from "../../../../inputs/SelectImage";

const ValidationSchema = z.object({
  awardBundleCount: z.number().min(0),
  fileId: z.string(),
  name: z.string().min(1),
  awardIds: z.array(z.string()),
  awardsNotFormThisEdition: z.array(z.string()),
});

export type ChestFormValues = z.infer<typeof ValidationSchema>;

type AddChestFormProps = {
  handleConfirm: (values: ChestFormValues) => void;
  formError?: string;
  initialValues?: ChestFormValues;
  awardsInThisEdition: Award[];
  awardsNotInThisEdition: Award[];
  title: string;
  imageIds: string[];
};

const defaultInitialValues: ChestFormValues = {
  awardBundleCount: 1,
  fileId: "",
  name: "",
  awardIds: [],
  awardsNotFormThisEdition: [],
};

export const AddChestForm = ({
  handleConfirm,
  imageIds,
  formError,
  awardsInThisEdition = [],
  awardsNotInThisEdition = [],
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
        errors.fileId = "select file";
      }

      if (values.awardIds.length === 0) {
        errors.awardIds = "select at least one award";
      }

      if (values.awardIds.length < values.awardBundleCount) {
        errors.awardIds =
          "number of selected awards in this edition cannot be smaller than awardBundleCount";
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
            name="awardBundleCount"
            label="awardBundleCount"
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
            label="name"
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
            title="select image:"
          />

          <SelectImage
            type="award"
            options={awardsInThisEdition}
            selectedIds={formik.values.awardIds}
            onSelectClick={(updatedIds: string[]) =>
              formik.setValues({ ...formik.values, awardIds: updatedIds })
            }
            error={formik.errors.awardIds as string}
            touched={formik.touched.awardIds}
            selectVariant={"multiple"}
            title={"select awards:"}
          />

          <SelectImage
            type="award"
            options={awardsNotInThisEdition}
            selectedIds={formik.values.awardsNotFormThisEdition}
            onSelectClick={(updatedIds: string[]) =>
              formik.setValues({
                ...formik.values,
                awardsNotFormThisEdition: updatedIds,
              })
            }
            error={undefined}
            touched={undefined}
            selectVariant={"multiple"}
            title={"select awards not from edition:"}
          />
        </div>
        <button type="submit">confirm</button>
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
  title: { fontWeight: "bold" },
  error: { color: "red" },
  fieldsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};