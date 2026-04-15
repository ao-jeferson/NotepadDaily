from PySide6.QtGui import QAction
from PySide6.QtWidgets import QFileDialog
from core.recent_files import RecentFiles
from core.settings import Settings


class MenuBarBuilder:
    def __init__(self, main_window):
        self.main_window = main_window
        self.menu_bar = main_window.menuBar()
        self.recent_menu = None

    def build(self):
        self.create_file_menu()
        self.create_settings_menu()

    def create_file_menu(self):
        file_menu = self.menu_bar.addMenu("Arquivo")

        file_menu.addAction("Novo", self.main_window.new_file)

        open_action = QAction("Abrir…", self.main_window)
        open_action.triggered.connect(self.open_file)
        file_menu.addAction(open_action)

        self.recent_menu = file_menu.addMenu("Arquivos recentes")
        self.update_recent_files_menu()

        file_menu.addSeparator()
        file_menu.addAction("Sair", self.main_window.close)

    def create_settings_menu(self):
        settings_menu = self.menu_bar.addMenu("Configurações")

        self.datetime_action = QAction(
            "Usar data/hora como nome da nova aba",
            self.main_window
        )
        self.datetime_action.setCheckable(True)
        self.datetime_action.setChecked(Settings.USE_DATETIME_TAB_NAME)
        self.datetime_action.toggled.connect(self.on_toggle_datetime)

        settings_menu.addAction(self.datetime_action)

    def on_toggle_datetime(self, checked: bool):
        Settings.USE_DATETIME_TAB_NAME = checked

    def open_file(self):
        path, _ = QFileDialog.getOpenFileName(
            self.main_window,
            "Abrir arquivo",
            "",
            "Arquivos de texto (*.txt);;Todos os arquivos (*)",
        )

        if path:
            self.main_window.open_file(path)
            RecentFiles.add(path)
            self.update_recent_files_menu()

    def update_recent_files_menu(self):
        self.recent_menu.clear()
        files = RecentFiles.list()

        if not files:
            action = QAction("(Nenhum arquivo)", self.main_window)
            action.setEnabled(False)
            self.recent_menu.addAction(action)
            return

        for path in files:
            action = QAction(path, self.main_window)
            action.triggered.connect(
                lambda _, p=path: self.main_window.open_file(p)
            )
            self.recent_menu.addAction(action)