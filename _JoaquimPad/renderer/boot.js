import { EditorCore } from "../core/editor/EditorCore.js";
import { FileSystemService } from "../core/filesystem/FileSystemService.js";
import { StatusBar } from "../core/statusbar/StatusBar.js";

window.createEditor = () => {
  const container = document.getElementById("editor");

  EditorCore.init(container);

  const fsService = new FileSystemService(EditorCore);
  fsService.attachEditorListeners();

  const statusBar = new StatusBar(EditorCore);
  statusBar.init();

  // menu handlers (já funcionando)
  window.menu.onNewFile(() => {
    EditorCore.setText("");
  });

  window.menu.onOpenFile(() => fsService.openFile());
  window.menu.onSaveFile(() => fsService.saveFile());
  window.menu.onSaveAsFile(() => fsService.saveFileAs());
};