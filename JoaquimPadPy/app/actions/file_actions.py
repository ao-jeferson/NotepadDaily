from PyQt6.QtWidgets import QFileDialog

class FileActions:
    def __init__(self, editor_manager, parent=None):
        self.editor_manager = editor_manager
        self.parent = parent

    def new_file(self):
        self.editor_manager.new_editor()

    def open_file(self):
        path, _ = QFileDialog.getOpenFileName(
            self.parent,
            "Abrir arquivo"
        )
        if not path:
            return

        with open(path, "r", encoding="utf-8") as file:
            content = file.read()

        self.editor_manager.new_editor(title=path.split("/")[-1])
        editor = self.editor_manager.current_editor()
        editor.setText(content)

    def save_file(self):
        editor = self.editor_manager.current_editor()
        if editor:
            # placeholder (fase seguinte)
            print("Salvar arquivo")

    def save_as_file(self):
        # placeholder
        print("Salvar como")