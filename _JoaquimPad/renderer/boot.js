/* =====================================================
   CORE
   ===================================================== */
/* =====================================================
   FEATURES
   ===================================================== */
import { createEditor } from "./App.js";

window.createEditor = createEditor;

window.addEventListener("unhandledrejection", (event) => {
  if (typeof event.reason === "string" && event.reason.includes("Canceled")) {
    event.preventDefault();
  }
});
