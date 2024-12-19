import { useFormik } from "formik";
import { SelectImage } from "../../components/inputs/SelectImage";
import TextField from "@mui/material/TextField";
import { z, ZodError } from "zod";
import { formStyles } from "../../utils/utils.ts";
import { FormButton } from "../../components/form/FormButton.tsx";
import { FormError } from "../../components/form/FormError.tsx";

export type SetupUserFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  nick: z.string().min(1, "wymagane"),
  avatarId: z.string().min(1, "wymagane"),
});

type SetupUserFormProps = {
  formError?: string;
  handleSubmit: (values: SetupUserFormValues) => void;
  imageIds: string[];
};

export const SetupUserForm = ({
  formError,
  handleSubmit,
  imageIds,
}: SetupUserFormProps) => {
  const formik = useFormik<SetupUserFormValues>({
    initialValues: {
      nick: "",
      avatarId: "",
    },
    validate: (values) => {
      try {
        ValidationSchema.parse(values);
        return {};
      } catch (error) {
        if (error instanceof ZodError) {
          return error.formErrors.fieldErrors;
        }
      }
    },
    onSubmit: handleSubmit,
  });

  return (
    <div style={formStyles.formContainer}>
      <form onSubmit={formik.handleSubmit}>
        <div style={formStyles.fieldsContainer}>
          <TextField
            label="Nick"
            variant="outlined"
            name="nick"
            value={formik.values.nick}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={!!formik.errors.nick && formik.touched.nick}
            helperText={formik.touched.nick && formik.errors.nick}
            fullWidth
          />

          <SelectImage
            type="withoutTooltip"
            options={imageIds}
            selectedIds={formik.values.avatarId ? [formik.values.avatarId] : []}
            onSelectClick={(updatedIds: string[]) =>
              formik.setFieldValue("avatarId", updatedIds[0] ?? "")
            }
            error={formik.errors.avatarId}
            touched={formik.touched.avatarId}
            selectVariant={"single"}
            title="Wybierz avatara:"
          />

          <FormError error={formError} isFormError={true} />
          <FormButton />
        </div>
      </form>
    </div>
  );
};
