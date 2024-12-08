import { tokens } from "../../tokens";
import { Styles } from "../../utils/Styles";

type TextInputProps = {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value: string;
  error?: string;
  touched?: boolean;
  name: string;
  label?: string;
  placeholder?: string;
};

export const TextInput = ({
  handleChange,
  handleBlur,
  value,
  error,
  touched,
  name,
  label,
  placeholder,
}: TextInputProps) => {
  return (
    <div style={styles.container}>
      <label>{label}</label>
      <input
        style={styles.input}
        name={name}
        type="text"
        onChange={handleChange}
        onBlur={handleBlur}
        value={value}
        placeholder={placeholder}
      />
      {error && touched ? <div style={styles.error}>{error}</div> : null}
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    flex: 1,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    fontSize: tokens.font.text,
    border: "none",
  },
  error: {
    color: "red",
  },
};
