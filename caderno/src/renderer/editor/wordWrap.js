define(["editor/state"], function (state) {

  function applyWordWrap() {
    if (!state.editor || !state.editor.getModel()) return;

    state.editor.updateOptions({
      wordWrap: state.wordWrapEnabled ? "on" : "off",
      wrappingIndent: "same"
    });
  }

  function toggleWordWrap() {
    state.wordWrapEnabled = !state.wordWrapEnabled;
    applyWordWrap();
  }

  return { applyWordWrap, toggleWordWrap };
});