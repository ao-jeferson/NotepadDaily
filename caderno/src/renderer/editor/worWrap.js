import { state } from "./state.js";

export function applyWordWrap() {
  state.editor.updateOptions({
    wordWrap: state.wordWrapEnabled ? "on" : "off",
    wrappingIndent: "same"
  });
}

export function toggleWordWrap() {
  state.wordWrapEnabled = !state.wordWrapEnabled;
  applyWordWrap();

  if (window.menuAPI) {
    window.menuAPI.updateWordWrap(state.wordWrapEnabled);
  }
}