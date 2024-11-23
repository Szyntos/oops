import React from "react";
import { FormikErrors, useFormik } from "formik";
import { z, ZodError } from "zod";

interface SelectImageProps {
  type: string;
  options: string[];
  selectedIds: string[];
  onSelectClick: (updatedIds: string[]) => void;
  error?: string;
  touched?: boolean;
  selectVariant: string;
  title: string;
}

const SelectImage: React.FC<SelectImageProps> = ({
  options,
  selectedIds,
  onSelectClick,
  error,
  touched,
  selectVariant,
  title,
}) => {
  return (
    <div>
      <h3>{title}</h3>
      <div style={{ display: "flex", gap: "10px" }}>
        {options.map((id) => (
          <div
            key={id}
            style={{
              border: selectedIds.includes(id)
                ? "2px solid blue"
                : "2px solid gray",
              padding: "5px",
              cursor: "pointer",
            }}
            onClick={() =>
              onSelectClick(
                selectedIds.includes(id)
                  ? selectedIds.filter((item) => item !== id)
                  : selectVariant === "single"
                    ? [id]
                    : [...selectedIds, id],
              )
            }
          >
            <img
              src={`https://via.placeholder.com/100?text=${id}`}
              alt={`Image ${id}`}
              style={{ width: "100px", height: "100px" }}
            />
          </div>
        ))}
      </div>
      {touched && error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

const AvatarAndNickScreen = () => {
  const imageIds = ["1", "2", "3", "4"];

  const ValidationSchema = z.object({
    nick: z.string().min(1),
    fileId: z.string(),
  });
  type AvatarAndNickValues = z.infer<typeof ValidationSchema>;
  const formik = useFormik({
    initialValues: {
      nick: "",
      fileId: "",
    },
    validate: (values: AvatarAndNickValues) => {
      const errors: FormikErrors<AvatarAndNickValues> = {};
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

      if (values.nick === "") {
        errors.nick = "choose nick";
      }

      return errors;
    },
    onSubmit: (values: AvatarAndNickValues) => {
      console.log("Form Submitted!", values);
    },
  });

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <form onSubmit={formik.handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label
            htmlFor="nick"
            style={{ display: "block", marginBottom: "5px" }}
          >
            Nickname:
          </label>
          <input
            id="nick"
            name="nick"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.nick}
            style={{
              width: "100%",
              padding: "8px",
              border:
                formik.touched.nick && formik.errors.nick
                  ? "2px solid red"
                  : "1px solid gray",
            }}
          />
          {formik.touched.nick && formik.errors.nick && (
            <p style={{ color: "red" }}>{formik.errors.nick}</p>
          )}
        </div>

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
          selectVariant="single"
          title="Select Image:"
        />

        <button
          type="submit"
          style={{ marginTop: "20px", padding: "10px 20px" }}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AvatarAndNickScreen;
