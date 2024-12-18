import { z, ZodError } from "zod";
import { useFormik } from "formik";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Group } from "./ChangeGroupDialog";
import { formStyles } from "../../../utils/utils";
import { FormError } from "../../form/FormError";
import { FormButton } from "../../form/FormButton";

export type ChangeGroupFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  groupId: z.string().min(1, "required"),
});

type ChangeGroupFormProps = {
  handleConfirm: (values: ChangeGroupFormValues) => void;
  formError: string | undefined;
  initGroupId: string;
  groups: Group[];
};

export const ChangeGroupForm = ({
  handleConfirm,
  formError,
  groups,
  initGroupId: groupId,
}: ChangeGroupFormProps) => {
  const formik = useFormik({
    initialValues: {
      groupId,
    },
    validate: (values: ChangeGroupFormValues) => {
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          return error.formErrors.fieldErrors;
        }
      }
    },
    onSubmit: (values: ChangeGroupFormValues) => {
      handleConfirm(values);
    },
  });

  return (
    <div style={formStyles.formContainer}>
      <form onSubmit={formik.handleSubmit}>
        <div style={formStyles.fieldsContainer}>
          <FormControl fullWidth>
            <InputLabel
              error={Boolean(formik.touched.groupId && formik.errors.groupId)}
            >
              Grupa
            </InputLabel>
            <Select
              name="groupId"
              value={formik.values.groupId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.groupId && formik.errors.groupId)}
            >
              {groups.map((group) => (
                <MenuItem key={group.groupsId} value={group.groupsId}>
                  {group.generatedName}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.groupId && formik.errors.groupId && (
              <FormError error={formik.errors.groupId} />
            )}
          </FormControl>

          <FormButton />
        </div>
      </form>

      <FormError error={formError} />
    </div>
  );
};
