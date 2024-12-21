import { styles } from "./inputs.styles";

type NumberInputProps = {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  value: number;
  error?: string;
  touched?: boolean;
  name: string;
  label?: string;
};

export const NumberInput = ({
  handleChange,
  handleBlur,
  value,
  error,
  touched,
  name,
  label,
}: NumberInputProps) => {
  return (
    <div>
      <label>{label}</label>
      <input
        name={name}
        type="Numer"
        onChange={handleChange}
        onBlur={handleBlur}
        value={value}
      />
      {error && touched ? <div style={styles.error}>{error}</div> : null}
    </div>
  );
};
