// --------------------------------------------------
// ZOOM COM CTRL + RODA DO MOUSE (MONACO)
// --------------------------------------------------

(function () {
  let editor = null;
  let fontSize = 14;

  const MIN_FONT_SIZE = 10;
  const MAX_FONT_SIZE = 32;

  function attachZoom(editorInstance, container) {
    if (!editorInstance || !container) return;

    editor = editorInstance;

    editor.updateOptions({ fontSize });

    container.addEventListener(
      "wheel",
      (e) => {
        // Apenas CTRL + SCROLL
        if (!e.ctrlKey) return;

        e.preventDefault();
        e.stopPropagation();

        const delta = e.deltaY < 0 ? 1 : -1;

        fontSize = Math.max(
          MIN_FONT_SIZE,
          Math.min(MAX_FONT_SIZE, fontSize + delta)
        );

        editor.updateOptions({ fontSize });
      },
      { passive: false }
    );
  }

  // Expondo uma API mínima global
  window.zoomFeature = {
    init(editorInstance) {
      const container = document.getElementById("editor-left");
      attachZoom(editorInstance, container);
    },
  };
})();