define(["editor/state"], function (state) {
  function createEditor(container) {
    state.editor = monaco.editor.create(container, {
      automaticLayout: true
    });
    return state.editor;
  }

  return { createEditor };
});