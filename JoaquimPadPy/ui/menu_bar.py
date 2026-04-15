from PySide6.QtGui import QAction
from PySide6.QtWidgets import QFileDialog

from core.recent_files import RecentFiles
from core.settings import Settings


class MenuBarBuilder:
    def __init__(self, main_window):
        self.main_window = main_window
        self.menu_bar = main_window.menuBar()
        self.recent_menu = None

    # ============================
    # Builder principal
    # ============================
    def build(self):
        self.menu_bar.clear()
        self.create_file_menu()
        self.create_settings_menu()

    # ============================
    # MENU ARQUIVO
    # ============================
    def create_file_menu(self):
        file_menu = self.menu_bar.addMenu("Arquivo")

        # Novo
        file_menu.addAction("Novo", self.main_window.new_file)

        # Abrir
        open_action = QAction("Abrir…", self.main_window)
        open_action.triggered.connect(self.open_file)
        file_menu.addAction(open_action)

        file_menu.addSeparator()

        # Salvar
        save_action = QAction("Salvar", self.main_window)
        save_action.triggered.connect(self.main_window.save_file)
        file_menu.addAction(save_action)

        # Salvar como…
        save_as_action = QAction("Salvar como…", self.main_window)
        save_as_action.triggered.connect(self.main_window.save_file_as)
        file_menu.addAction(save_as_action)

        file_menu.addSeparator()

        # Arquivos recentes
        self.recent_menu = file_menu.addMenu("Arquivos recentes")
        self.update_recent_files_menu()

        clear_recent = QAction("Limpar arquivos recentes", self.main_window)
        clear_recent.triggered.connect(self.clear_recent_files)
        file_menu.addAction(clear_recent)

        file_menu.addSeparator()

        # Sair
        file_menu.addAction("Sair", self.main_window.close)

    # ============================
    # MENU CONFIGURAÇÕES
    # ============================
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

    # ============================
    # AÇÕES
    # ============================
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

    def clear_recent_files(self):
        RecentFiles.clear()
        self.update_recent_files_menu()