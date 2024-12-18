import { z, ZodError } from "zod";
import { useFormik } from "formik";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Weekday } from "../../../../hooks/common/useGroupsData";
import { Student, Teacher } from "../../../../hooks/Edition/useGroupsSection";
import { StudentSelection } from "./StudentSelection/StudentSelection";
import { useRef, useState } from "react";
import { formStyles, TIME_HH_MM_REGEXP } from "../../../../utils/utils";
import { FormError } from "../../../form/FormError";
import { FormButton } from "../../../form/FormButton";

export type GroupFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  startTime: z
    .string()
    .min(1, { message: "wymagane " })
    .regex(TIME_HH_MM_REGEXP, {
      message: "Godzina rozpoczęcia musi być w formacie hh:mm",
    }),
  endTime: z
    .string()
    .min(1, { message: "wymagane " })
    .regex(TIME_HH_MM_REGEXP, {
      message: "Godzina zakończenia musi być w formacie hh:mm",
    }),
  weekdayId: z.string().min(1, { message: "wymagane" }),
  teacherId: z.string().min(1, { message: "wymagane" }),
  usosId: z.number().min(1, { message: "USOS ID nie może być liczbą ujemną." }),
});

type AddGroupFormProps = {
  handleAddGroup: (
    values: GroupFormValues,
    selectedStudents: Student[],
  ) => void;
  createError?: string;
  weekdays: Weekday[];
  teachers: Teacher[];
  students: Student[];
  variant?: AddGroupVariant;
  handleUploadStudents?: (editionId: number, formData: FormData) => void;
  editionId: number;
  initSelected?: Student[];
  initValues?: GroupFormValues;
};

export type AddGroupVariant = "select" | "import";

export const AddGroupForm = ({
  handleAddGroup,
  createError,
  weekdays,
  teachers,
  students,
  variant: variant = "import",
  handleUploadStudents,
  editionId,
  initSelected = [],
  initValues = {
    startTime: "",
    endTime: "",
    weekdayId: "",
    teacherId: "",
    usosId: 1,
  },
}: AddGroupFormProps) => {
  const formik = useFormik({
    initialValues: {
      startTime: initValues.startTime,
      endTime: initValues.endTime,
      weekdayId: initValues.weekdayId,
      teacherId: initValues.teacherId,
      usosId: initValues.usosId,
    },
    validate: (values: GroupFormValues) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors: any = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }

        const [startHour, startMinute] = values.startTime
          .split(":")
          .map(Number);
        const [endHour, endMinute] = values.endTime.split(":").map(Number);

        const isEndTimeValid: boolean =
          startHour < endHour ||
          (startHour === endHour && startMinute < endMinute);

        if (!isEndTimeValid) {
          errors.endTime = `Czas zakończenia musi być po czasie startu.`;
        }

        return errors;
      }
    },
    onSubmit: (values: GroupFormValues) => {
      const groupValues = {
        startTime: values.startTime,
        endTime: values.endTime,
        weekdayId: values.weekdayId,
        teacherId: values.teacherId,
        usosId: values.usosId,
      };
      handleAddGroup(groupValues, selectedStudents);
    },
  });

  // SELECT VARIANT ----------------------------------------------------
  const [selectedStudents, setSelectedStudents] =
    useState<Student[]>(initSelected);

  const studentsToSelect = students.filter((s) => {
    const isSelected =
      selectedStudents.find((ss) => ss.userId === s.userId) !== undefined;
    return !isSelected;
  });

  const handleAdd = (student: Student) => {
    setSelectedStudents((prev) => [...prev, student]);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudents((prev) =>
      prev.filter((s) => s.userId !== student.userId),
    );
  };

  // IMPORT VARIANT ------------------------------------------------------

  const [importedFile, setImportedFile] = useState("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append("file", files[0]);
      setImportedFile(files[0].name);
      formData.append("fileType", "text/csv");
      // I don't know how to fix it other way
      const uploadedStudents: Student[] = (await handleUploadStudents?.(
        editionId,
        formData,
      )) as unknown as Student[];
      setSelectedStudents(uploadedStudents);
      event.target.value = "";
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={formStyles.formContainer}>
      <form onSubmit={formik.handleSubmit}>
        <div style={formStyles.fieldsContainer}>
          <TextField
            fullWidth
            name="startTime"
            label="Czas startu"
            variant="outlined"
            placeholder="hh:mm"
            value={formik.values.startTime}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.startTime && formik.errors.startTime)}
            helperText={formik.touched.startTime && formik.errors.startTime}
          />

          <TextField
            fullWidth
            name="endTime"
            label="Czas zakończenia"
            variant="outlined"
            placeholder="hh:mm"
            value={formik.values.endTime}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.endTime && formik.errors.endTime)}
            helperText={formik.touched.endTime && formik.errors.endTime}
          />

          <FormControl fullWidth>
            <InputLabel
              error={Boolean(
                formik.touched.weekdayId && formik.errors.weekdayId,
              )}
            >
              Dzień Tygodnia
            </InputLabel>
            <Select
              name="weekdayId"
              value={formik.values.weekdayId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.weekdayId && formik.errors.weekdayId,
              )}
            >
              {weekdays.map((weekday) => (
                <MenuItem key={weekday.id} value={weekday.id}>
                  {weekday.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.weekdayId && formik.errors.weekdayId && (
              <FormError error={formik.errors.weekdayId} />
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel
              error={Boolean(
                formik.touched.teacherId && formik.errors.teacherId,
              )}
            >
              Prowadzący
            </InputLabel>
            <Select
              name="teacherId"
              value={formik.values.teacherId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.teacherId && formik.errors.teacherId,
              )}
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher.userId} value={teacher.userId}>
                  {teacher.firstName} {teacher.secondName}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.teacherId && formik.errors.teacherId && (
              <FormError error={formik.errors.teacherId} />
            )}
          </FormControl>

          <TextField
            fullWidth
            name="usosId"
            label="usosId"
            variant="outlined"
            type="number"
            value={formik.values.usosId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.usosId && formik.errors.usosId)}
            helperText={formik.touched.usosId && formik.errors.usosId}
          />

          {variant === "select" ? (
            <StudentSelection
              students={studentsToSelect}
              selectedStudents={selectedStudents}
              handleAdd={handleAdd}
              handleDelete={handleDelete}
            />
          ) : (
            // TODO
            <div>
              <button type="button" onClick={handleUploadClick}>
                Importuj studentów
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {importedFile && <div>Zaimportowany plik: {importedFile}</div>}
              {selectedStudents.map((s, index) => (
                <div>
                  {index + 1}. {s.firstName} {s.secondName}
                </div>
              ))}
            </div>
          )}

          <FormButton />
        </div>
      </form>

      <FormError error={createError} />
    </div>
  );
};
