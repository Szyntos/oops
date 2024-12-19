import { GroupRadioFilterItem } from "../components/Groups/RadioFilterGroup";

export const getEnvVariable = (key: string, fallback: string = ""): string => {
  const value = (import.meta.env[key] as string | undefined) ?? fallback;
  if (!value) {
    console.warn(`Environment variable ${key} is not defined.`);
  }
  return value;
};

// export const FETCH_FILES_URL = "http://localhost:9090/files/";
export const FETCH_FILES_URL =
  "http://" + getEnvVariable("VITE_PUBLIC_IP") + ":9090/files/";
// export const UPLOAD_FILES_URL = "http://localhost:9090/files/upload";
export const UPLOAD_FILES_URL =
  "http://" + getEnvVariable("VITE_PUBLIC_IP") + ":9090/files/upload";

// export const HTTP_GRAPHQL_URL = "http://127.0.0.1:9191/v1/graphql";
export const HTTP_GRAPHQL_URL =
  "http://" + getEnvVariable("VITE_PUBLIC_IP") + ":9191/v1/graphql";
// export const WEB_SOCKET_GRAPHQL_URL = "ws://127.0.0.1:9191/v1/graphql";
export const WEB_SOCKET_GRAPHQL_URL =
  "ws://" + getEnvVariable("VITE_PUBLIC_IP") + ":9191/v1/graphql";

// TODO try to reuse it in hall of fame
export const groupsRadioButtonOptions: GroupRadioFilterItem[] = [
  { id: "all", name: "Wszystkie" },
  { id: "yours", name: "Twoje" },
  { id: "foreign", name: "Obce" },
];

export const dateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

export const EMPTY_FIELD_STRING = "---";
