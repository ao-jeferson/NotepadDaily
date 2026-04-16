class StatusController:
    def __init__(self, status_bar):
        self.status_bar = status_bar
        self.editor = None

    def connect_editor(self, editor):
        # Desconecta editor anterior
        if self.editor:
            try:
                self.editor.cursor_position_changed.disconnect(
                    self.update_cursor_position
                )
                self.editor.textChanged.disconnect(
                    self.update_file_size
                )
            except Exception:
                pass

        self.editor = editor

        # Conexões explícitas e SEGURAS
        editor.cursor_position_changed.connect(
            self.update_cursor_position
        )
        editor.textChanged.connect(
            self.update_file_size
        )

        # Atualização inicial
        self.update_cursor_position(1, 1)
        self.update_file_size()

    # ============================
    # Métodos NORMAIS (não-slots)
    # ============================
    def update_cursor_position(self, line, column):
        self.status_bar.set_cursor_position(line, column)

    def update_file_size(self):
        if not self.editor:
            self.status_bar.set_file_size("")
            return

        text = self.editor.toPlainText()
        size_bytes = len(text.encode("utf-8"))

        if size_bytes < 1024:
            size_text = f"{size_bytes} bytes"
        else:
            size_text = f"{size_bytes / 1024:.1f} KB"

        self.status_bar.set_file_size(size_text)