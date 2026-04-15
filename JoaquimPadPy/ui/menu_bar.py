from PySide6.QtGui import QAction, QIcon
from PySide6.QtWidgets import QFileDialog
from pathlib import Path

from core.recent_files import RecentFiles
from core.settings import Settings


class MenuBarBuilder:
    def __init__(self, main_window):
        self.main_window = main_window
        self.menu_bar = main_window.menuBar()
        self.recent_menu = None

    # ============================
    # Helper para ícones SVG
    # ============================
    def icon(self, name: str) -> QIcon:
        return QIcon(str(Path("assets/icons") / name))

    # ============================
    # Build
    # ============================
    def build(self):
        # 🔴 MUITO IMPORTANTE: evita menus duplicados
        self.menu_bar.clear()

        self.create_file_menu()
        self.create_edit_menu()
        self.create_settings_menu()

    # ============================
    # MENU ARQUIVO
    # ============================
    def create_file_menu(self):
        file_menu = self.menu_bar.addMenu(
            self.icon("file.svg"), "Arquivo"
        )

        # Novo
        new_action = QAction(
            self.icon("new.svg"), "Novo", self.main_window
        )
        new_action.setShortcut("Ctrl+N")
        new_action.triggered.connect(self.main_window.new_file)
        file_menu.addAction(new_action)

        # Abrir
        open_action = QAction(
            self.icon("open.svg"), "Abrir…", self.main_window
        )
        open_action.setShortcut("Ctrl+O")
        open_action.triggered.connect(self.open_file)
        file_menu.addAction(open_action)

        file_menu.addSeparator()

        # Salvar
        save_action = QAction(
            self.icon("save.svg"), "Salvar", self.main_window
        )
        save_action.setShortcut("Ctrl+S")
        save_action.triggered.connect(self.main_window.save_file)
        file_menu.addAction(save_action)

        # Salvar como
        save_as_action = QAction(
            self.icon("save_as.svg"), "Salvar como…", self.main_window
        )
        save_as_action.setShortcut("Ctrl+Shift+S")
        save_as_action.triggered.connect(self.main_window.save_file_as)
        file_menu.addAction(save_as_action)

        file_menu.addSeparator()

        # Arquivos recentes
        self.recent_menu = file_menu.addMenu("Arquivos recentes")
        self.update_recent_files_menu()

        clear_recent = QAction(
            "Limpar arquivos recentes", self.main_window
        )
        clear_recent.triggered.connect(self.clear_recent_files)
        file_menu.addAction(clear_recent)

        file_menu.addSeparator()

        # Fechar todas as abas
        close_all_action = QAction(
            self.icon("close_all.svg"),
            "Fechar todas as abas",
            self.main_window
        )
        close_all_action.setShortcut("Ctrl+Shift+W")
        close_all_action.triggered.connect(
            self.main_window.close_all_tabs
        )
        file_menu.addAction(close_all_action)

        file_menu.addSeparator()

        # Sair
        exit_action = QAction(
            "Sair", self.main_window
        )
        exit_action.setShortcut("Ctrl+Q")
        exit_action.triggered.connect(self.main_window.close)
        file_menu.addAction(exit_action)

    # ============================
    # MENU EDITAR
    # ============================
    def create_edit_menu(self):
        edit_menu = self.menu_bar.addMenu(
            self.icon("edit.svg"), "Editar"
        )

        # Buscar / Substituir
        find_action = QAction(
            self.icon("search.svg"),
            "Buscar / Substituir",
            self.main_window
        )
        find_action.setShortcut("Ctrl+F")
        find_action.triggered.connect(
            self.main_window.open_find_replace
        )
        edit_menu.addAction(find_action)

        edit_menu.addSeparator()

        format_action = QAction("Formatar Documento", self.main_window)
        format_action.setShortcut("Ctrl+Shift+F")  # atalho alternativo
        format_action.triggered.connect(self.main_window.format_document)

        edit_menu.addSeparator()

        # Fixar / Desafixar aba
        pin_action = QAction(
            self.icon("pin.svg"),
            "Fixar / Desafixar aba",
            self.main_window
        )
        pin_action.setShortcut("Ctrl+P")
        pin_action.triggered.connect(
            self.main_window.toggle_pin_current_tab
        )
        edit_menu.addAction(pin_action)
         # ----------------------------
        # Word Wrap
        # ----------------------------
        word_wrap_action = QAction("Quebra automática de linha", self.main_window)
        word_wrap_action.setCheckable(True)
        word_wrap_action.setChecked(True)  # ligado por padrão
        word_wrap_action.triggered.connect(self.main_window.toggle_word_wrap)
        word_wrap_action.setShortcut("Alt+Z")
        
        edit_menu.addSeparator()
        edit_menu.addAction(word_wrap_action)

    # ============================
    # MENU CONFIGURAÇÕES
    # ============================
    def create_settings_menu(self):
        settings_menu = self.menu_bar.addMenu(
            self.icon("settings.svg"), "Configurações"
        )

        datetime_action = QAction(
            "Usar data/hora como nome da nova aba",
            self.main_window
        )
        datetime_action.setCheckable(True)
        datetime_action.setChecked(
            Settings.USE_DATETIME_TAB_NAME
        )
        datetime_action.toggled.connect(
            self.on_toggle_datetime
        )

        settings_menu.addAction(datetime_action)
        
       


    # ============================
    # AÇÕES
    # ============================
    def on_toggle_datetime(self, checked: bool):
        Settings.USE_DATETIME_TAB_NAME = checked

    def open_file(self):
        path, _ = QFileDialog.getOpenFileName(
            self.main_window,
            "Abrir arquivo",
            "",
            "Todos os arquivos (*.*);;Arquivos de texto (*.txt);;Arquivos Python (*.py);;Arquivos Markdown (*.md)"
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
        
    def create_language_menu(self):
        lang_menu = self.menu_bar.addMenu("Linguagem")

        languages = ["Plain Text", "Python"]

        for lang in languages:
            action = QAction(lang, self.main_window)
            action.setCheckable(True)
            action.triggered.connect(
                lambda _, l=lang: self.main_window.set_language(l)
            )
            lang_menu.addAction(action)
    
    def update_language_status(self):
        editor = self.tabs.current_editor()
        if editor:
            self.status_bar.language_label.setText(editor.language)
        