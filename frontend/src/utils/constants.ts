import { GroupRadioFilterItem } from "../components/Groups/RadioFilterGroup";

export const FETCH_FILES_URL = "http://localhost:9090/files/";
export const UPLOAD_FILES_URL = "http://localhost:9090/files/upload";

export const GRAPHQL_URI = "http://127.0.0.1:9191/v1/graphql";

// TODO try to reuse it in hall of fame
export const groupsRadioButtonOptions: GroupRadioFilterItem[] = [
  { id: "all", name: "wszystkie" },
  { id: "yours", name: "twoje" },
  { id: "foreign", name: "obce" },
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
