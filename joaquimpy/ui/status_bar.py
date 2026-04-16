from PySide6.QtWidgets import QStatusBar, QLabel


class StatusBar(QStatusBar):
    def __init__(self, parent=None):
        super().__init__(parent)

        self.cursor_label = QLabel("Ln 1, Col 1")
        self.size_label = QLabel("0 bytes")
        self.language_label = QLabel("Plain Text")

        self.addWidget(self.cursor_label)
        self.addWidget(self.size_label)
        self.addPermanentWidget(self.language_label)

    def set_cursor_position(self, line, column):
        self.cursor_label.setText(f"Ln {line}, Col {column}")

    def set_file_size(self, text: str):
        self.size_label.setText(text)

    def set_language(self, language: str):
        self.language_label.setText(language)