
from pathlib import Path

from PySide6.QtWidgets import (
    QMainWindow,
    QFileDialog,
    QToolBar,
)
from PySide6.QtGui import QAction, QIcon, QTextCursor, Qt

from core.tab_manager import TabManager
from core.language_detection import detect_language_from_path
from core.session_manager import SessionManager
from core.settings import Settings
from core.util import Util

from file_system.file_service import FileService
from ui.menu_bar import MenuBarBuilder
from ui.status_bar import StatusBar
from ui.status_controller import StatusController
from ui.find_replace_dialog import FindReplaceDialog



class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        # =========================
        # Janela
        # =========================
        self.setWindowTitle("JoaquimPad — Text Editor")
        self.resize(900, 600)

        # =========================
        # Estados globais
        # =========================
        self._format_chord_active = False

        # Histórico GLOBAL do cursor (VS Code style)
        self._cursor_history = []
        self._cursor_history_index = -1
        self._ignore_cursor_history = False

        # =========================
        # Tabs (CRIAR UMA ÚNICA VEZ)
        # =========================
        self.tabs = TabManager()
        self.setCentralWidget(self.tabs)

        # =========================
        # Status Bar
        # =========================
        self.status_bar = StatusBar(self)
        self.setStatusBar(self.status_bar)
        self.status_controller = StatusController(self.status_bar)

        # =========================
        # Menu
        # =========================
        self.menu_builder = MenuBarBuilder(self)
        self.menu_builder.build()

        # =========================
        # Toolbar
        # =========================
        self.create_toolbar()

        # =========================
        # Serviços
        # =========================
        self.file_service = FileService()

        # =========================
        # Sinais
        # =========================
        self.tabs.currentChanged.connect(self.on_tab_changed)

        # =========================
        # Sessão (UMA VEZ)
        # =========================
        session = SessionManager.load()
        if session:
            self.restore_session(session)
        else:
            self.tabs.new_tab()

    # ======================================================
    # Sessão
    # ======================================================
    def restore_session(self, session: dict):
        tabs = session.get("tabs", [])
        if not tabs:
            self.tabs.new_tab()
            return

        # Pinadas primeiro
        pinned_tabs = [t for t in tabs if t.get("is_pinned")]
        normal_tabs = [t for t in tabs if not t.get("is_pinned")]

        for tab in pinned_tabs + normal_tabs:
            editor = self.tabs.new_tab(
                tab["title"],
                pinned=tab.get("is_pinned", False),
            )
            editor.setPlainText(tab.get("content", ""))
            editor.file_path = tab.get("file_path")
            editor.set_language(tab.get("language", "Plain Text"))

        index = session.get("current_index", len(tabs) - 1)
        if 0 <= index < self.tabs.count():
            self.tabs.setCurrentIndex(index)

    def closeEvent(self, event):
        try:
            SessionManager.save(
                self.tabs,
                self.tabs.currentIndex()
            )
        except Exception as e:
            print("Erro ao salvar sessão:", e)
        event.accept()

    # ======================================================
    # Arquivo
    # ======================================================
    def open_file(self, path: str):
        # Reusar aba se já estiver aberta
        for i in range(self.tabs.count()):
            editor = self.tabs.widget(i)
            if editor and editor.file_path == path:
                self.tabs.setCurrentIndex(i)
                return

        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
        except Exception as e:
            print("Erro ao abrir arquivo:", e)
            return

        editor = self.tabs.new_tab(Path(path).name)
        editor.setPlainText(content)
        editor.file_path = path

        # Auto-detecção de linguagem        
        language = detect_language_from_path(path)        
        editor.set_language(language)
        editor.format_document()
        self.update_language_status()

    # main_window.py

    
    def set_language(self, language: str):
        editor = self.tabs.current_editor()
        if not editor:
            return

        editor.set_language(language)
        editor.format_document()
        self.update_language_status()

    def new_file(self):
        if Settings.USE_DATETIME_TAB_NAME:
            name = Util.current_datetime_tab_name()
            index = self.tabs.find_tab_by_title(name)
            if index is not None:
                self.tabs.setCurrentIndex(index)
                editor = self.tabs.current_editor()
                cursor = editor.textCursor()
                cursor.movePosition(QTextCursor.End)
                editor.setTextCursor(cursor)
                editor.setFocus()
                return

            self.tabs.new_tab(name)
        else:
            self.tabs.new_tab(Util.current_datetime_tab_name())

    def save_file(self):
        editor = self.tabs.current_editor()
        if not editor:
            return

        path = editor.file_path
        if not path:
            self.save_file_as()
            return

        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(editor.toPlainText())
        except Exception as e:
            print("Erro ao salvar:", e)

    def save_file_as(self):
        editor = self.tabs.current_editor()
        if not editor:
            return

        path, _ = QFileDialog.getSaveFileName(
            self,
            "Salvar como",
            "",
            "Todos os arquivos (*.*)",
        )
        if not path:
            return

        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(editor.toPlainText())
        except Exception as e:
            print("Erro ao salvar:", e)
            return

        editor.file_path = path
        self.tabs.setTabText(self.tabs.currentIndex(), Path(path).name)

        # Atualiza recentes
        from core.recent_files import RecentFiles
        RecentFiles.add(path)

        if hasattr(self, "menu_builder"):
            self.menu_builder.update_recent_files_menu()

    # ======================================================
    # Tab / Editor
    # ======================================================
    def on_tab_changed(self, index):
        editor = self.tabs.current_editor()
        if not editor:
            return

        editor.set_word_wrap(editor.word_wrap_enabled)
        self.status_controller.connect_editor(editor)
        self.update_language_status()

        # ✅ sincroniza menu de linguagem
        if hasattr(self.menu_builder, "language_actions"):
            action = self.menu_builder.language_actions.get(editor.language)
            if action:
                action.setChecked(True)

        self._register_cursor_position()

    def close_current_tab(self):
        self.tabs.close_current_tab()
        
    def format_all_tabs(self):
        for i in range(self.tabs.count()):
            editor = self.tabs.widget(i)
            if editor:
                editor.format_document()

    def close_all_tabs(self):
        self.tabs.close_all_tabs()

    def toggle_pin_current_tab(self):
        index = self.tabs.currentIndex()
        if index >= 0:
            self.tabs.toggle_pin(index)

    # ======================================================
    # Find / Replace
    # ======================================================
    def open_find_replace(self):
        editor = self.tabs.current_editor()
        if not editor:
            return

        if not hasattr(self, "_find_replace_dialog"):
            self._find_replace_dialog = FindReplaceDialog(editor, self)
        else:
            self._find_replace_dialog.editor = editor

        self._find_replace_dialog.show()
        self._find_replace_dialog.raise_()
        self._find_replace_dialog.activateWindow()

    # ======================================================
    # Linguagem / Formatter
    # ======================================================
        
    def update_language_status(self):
        editor = self.tabs.current_editor()
        if editor:
            self.status_bar.language_label.setText(editor.language)
        else:
            self.status_bar.language_label.setText("")

    def format_document(self):
        editor = self.tabs.current_editor()
        if editor:
            editor.format_document()

    # ======================================================
    # Word Wrap
    # ======================================================
    def toggle_word_wrap(self, checked: bool):
        editor = self.tabs.current_editor()
        if editor:
            editor.set_word_wrap(checked)

    # ======================================================
    # Histórico do cursor (Go Back / Go Forward)
    # ======================================================
    def _register_cursor_position(self):
        if self._ignore_cursor_history:
            return

        editor = self.tabs.current_editor()
        if not editor:
            return

        pos = editor.textCursor().position()

        if (
            self._cursor_history_index >= 0
            and self._cursor_history[self._cursor_history_index]["editor"] == editor
            and self._cursor_history[self._cursor_history_index]["position"] == pos
        ):
            return

        # corta o futuro
        self._cursor_history = self._cursor_history[: self._cursor_history_index + 1]

        self._cursor_history.append({
            "editor": editor,
            "position": pos
        })
        self._cursor_history_index += 1

    def go_back_tab(self):
        if self._cursor_history_index > 0:
            self._ignore_cursor_history = True
            self._cursor_history_index -= 1

            entry = self._cursor_history[self._cursor_history_index]
            editor = entry["editor"]
            pos = entry["position"]

            self.tabs.setCurrentWidget(editor)
            cursor = editor.textCursor()
            cursor.setPosition(pos)
            editor.setTextCursor(cursor)
            editor.setFocus()

            self._ignore_cursor_history = False

    def go_forward_tab(self):
        if self._cursor_history_index < len(self._cursor_history) - 1:
            self._ignore_cursor_history = True
            self._cursor_history_index += 1

            entry = self._cursor_history[self._cursor_history_index]
            editor = entry["editor"]
            pos = entry["position"]

            self.tabs.setCurrentWidget(editor)
            cursor = editor.textCursor()
            cursor.setPosition(pos)
            editor.setTextCursor(cursor)
            editor.setFocus()

            self._ignore_cursor_history = False

    # ======================================================
    # Toolbar
    # ======================================================
    def create_toolbar(self):
        toolbar = QToolBar("Navegação")
        toolbar.setMovable(False)
        self.addToolBar(toolbar)

        back_action = QAction(QIcon("assets/icons/back.svg"), "", self)
        back_action.setToolTip("Voltar")
        back_action.triggered.connect(self.go_back_tab)
        toolbar.addAction(back_action)

        forward_action = QAction(QIcon("assets/icons/forward.svg"), "", self)
        forward_action.setToolTip("Avançar")
        forward_action.triggered.connect(self.go_forward_tab)
        toolbar.addAction(forward_action)

        toolbar.addSeparator()

        new_tab_action = QAction("+", self)
        new_tab_action.setToolTip("Nova aba")
        new_tab_action.triggered.connect(self.new_file)
        toolbar.addAction(new_tab_action)

    # ======================================================
    # Atalho em sequência (Ctrl+K, Ctrl+D)
    # ======================================================
    def keyPressEvent(self, event):
        if event.modifiers() == Qt.ControlModifier and event.key() == Qt.Key_K:
            self._format_chord_active = True
            return

        if (
            self._format_chord_active
            and event.modifiers() == Qt.ControlModifier
            and event.key() == Qt.Key_D
        ):
            self._format_chord_active = False
            self.format_document()
            return

        self._format_chord_active = False
        super().keyPressEvent(event)