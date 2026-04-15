from PySide6.QtGui import QAction, QKeySequence


class MenuBarBuilder:
    def __init__(self, main_window):
        self.main_window = main_window
        self.menu_bar = main_window.menuBar()

    def build(self):
        self.create_file_menu()
        self.create_edit_menu()

    # ----------------------
    # Arquivo
    # ----------------------
    def create_file_menu(self):
        file_menu = self.menu_bar.addMenu("&Arquivo")

        file_menu.addAction(self.action(
            "Novo", self.main_window.new_file, QKeySequence.New
        ))
        file_menu.addAction(self.action(
            "Abrir…", self.main_window.open_file, QKeySequence.Open
        ))
        file_menu.addAction(self.action(
            "Salvar", self.main_window.save_file, QKeySequence.Save
        ))
        file_menu.addAction(self.action(
            "Salvar como…", self.main_window.save_file_as, QKeySequence.SaveAs
        ))

        file_menu.addSeparator()

        file_menu.addAction(self.action(
            "Sair", self.main_window.close, QKeySequence.Quit
        ))

    # ----------------------
    # Editar
    # ----------------------
    def create_edit_menu(self):
        edit_menu = self.menu_bar.addMenu("&Editar")

        edit_menu.addAction(self.action(
            "Desfazer", self.main_window.undo, QKeySequence.Undo
        ))
        edit_menu.addAction(self.action(
            "Refazer", self.main_window.redo, QKeySequence.Redo
        ))

        edit_menu.addSeparator()

        edit_menu.addAction(self.action(
            "Recortar", self.main_window.cut, QKeySequence.Cut
        ))
        edit_menu.addAction(self.action(
            "Copiar", self.main_window.copy, QKeySequence.Copy
        ))
        edit_menu.addAction(self.action(
            "Colar", self.main_window.paste, QKeySequence.Paste
        ))

        edit_menu.addSeparator()

        edit_menu.addAction(self.action(
            "Selecionar tudo", self.main_window.select_all, QKeySequence.SelectAll
        ))

    # ----------------------
    # Helper
    # ----------------------
    def action(self, text, slot, shortcut=None):
        action = QAction(text, self.main_window)
        action.triggered.connect(slot)
        if shortcut:
            action.setShortcut(shortcut)
        return action