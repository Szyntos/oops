import { useContext } from "react";
import { UserContext } from "../../contexts/userContext";

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser musi być użyte z UserProvider");
  }
  return context;
}
