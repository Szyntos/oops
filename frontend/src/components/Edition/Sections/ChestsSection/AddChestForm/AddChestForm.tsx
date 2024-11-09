import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import { Styles } from "../../../../../utils/Styles";
import { TextField } from "@mui/material";
import { SelectImage } from "../../../../inputs/SelectImage";
import { MultipleImageSelect } from "../../../../inputs/MultipleImageSectec";
import { Award } from "../../../../../hooks/Edition/useAwardsSection";

const ValidationSchema = z.object({
  awardBundleCount: z.number().min(0),
  fileId: z.number(),
  name: z.string().min(1),
  awardIds: z.array(z.string()),
});

export type ChestFormValues = z.infer<typeof ValidationSchema>;

type AddChestFormProps = {
  handleConfirm: (values: ChestFormValues) => void;
  formError?: string;
  initialValues?: ChestFormValues;
  awards: Award[];
  title: string;
  imageIds: string[];
};

const defaultInitialValues: ChestFormValues = {
  awardBundleCount: 1,
  fileId: -1,
  name: "",
  awardIds: [],
};

export const AddChestForm = ({
  handleConfirm,
  imageIds,
  formError,
  awards = [],
  initialValues = defaultInitialValues,
  title,
}: AddChestFormProps) => {
  // const [awardIds, setAwardIds] = useState<number[]>(awardIds);

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

      if (values.fileId === -1) {
        errors.fileId = "select file";
      }

      if (values.awardIds.length === 0) {
        errors.awardIds = "select at least one award";
      }

      if (values.awardIds.length > values.awardBundleCount) {
        errors.awardIds =
          "number of selected awards have to be smaller than awardBundleCount";
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
            ids={imageIds}
            selectedId={formik.values.fileId.toString()}
            onSelectClick={(id: string) =>
              formik.setValues({ ...formik.values, fileId: parseInt(id) })
            }
            error={formik.errors.fileId}
            touched={formik.touched.fileId}
          />
          <MultipleImageSelect
            options={awards.map((award) => ({
              id: award.awardId,
              value: award.imageFileId as string,
            }))}
            selectedIds={formik.values.awardIds}
            onSelectClick={(updatedIds: string[]) =>
              formik.setValues({ ...formik.values, awardIds: updatedIds })
            }
            error={formik.errors.awardIds as string}
            touched={formik.touched.awardIds}
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
