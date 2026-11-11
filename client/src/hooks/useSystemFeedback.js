import { useContext } from "react";
import SystemFeedbackContext from "../components/systemFeedbackContext.js";

export default function useSystemFeedback() {
  const context = useContext(SystemFeedbackContext);
  if (!context) {
    throw new Error(
      "useSystemFeedback debe usarse dentro de SystemFeedbackProvider.",
    );
  }
  return context;
}
