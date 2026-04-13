import { EditorCore } from "../core/editor/EditorCore.js";
import { FileSystemService } from "../core/filesystem/FileSystemService.js";

console.log("[BOOT] boot.js carregado");

window.createEditor = () => {
  console.log("[BOOT] createEditor chamado");

  const container = document.getElementById("editor");

  EditorCore.init(container);

  const fsService = new FileSystemService(EditorCore);
  fsService.attachEditorListeners();

  console.log("[BOOT] registrando menu handlers");

  window.menu.onNewFile(() => {
    console.log("[MENU] Novo");
    EditorCore.setText("");
  });

  window.menu.onOpenFile(() => {
    console.log("[MENU] Abrir");
    fsService.openFile();
  });

  window.menu.onSaveFile(() => {
    console.log("[MENU] Salvar");
    fsService.saveFile();
  });

  window.menu.onSaveAsFile(() => {
    console.log("[MENU] Salvar como");
    fsService.saveFileAs();
  });
};