from PySide6.QtWidgets import QStatusBar, QLabel


class StatusBar(QStatusBar):
    def __init__(self, parent=None):
        super().__init__(parent)

        self.cursor_label = QLabel("Ln 1, Col 1", self)
        self.file_size_label = QLabel("0.00 KB", self)
        self.selection_label = QLabel("0 selecionados", self)

        self.addPermanentWidget(self.cursor_label)
        self.addPermanentWidget(self.file_size_label)
        self.addPermanentWidget(self.selection_label)

    def set_cursor_position(self, line, column):
        self.cursor_label.setText(f"Ln {line}, Col {column}")

    def set_file_size_kb(self, size_kb):
        self.file_size_label.setText(f"{size_kb:.2f} KB")

    def set_selection_size(self, size):
        self.selection_label.setText(f"{size} selecionados")