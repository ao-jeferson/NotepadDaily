from PySide6.QtWidgets import QMainWindow, QFileDialog
from core.tab_manager import TabManager
from core.util import Util
from services.file_service import FileService
from ui.menu_bar import MenuBarBuilder
from ui.status_bar import StatusBar
from ui.status_controller import StatusController
from core.settings import Settings
from datetime import datetime
from PySide6.QtGui import QIcon, QTextCursor
from core.session_manager import SessionManager
from ui.find_replace_dialog import FindReplaceDialog
from PySide6.QtWidgets import QToolBar
from PySide6.QtGui import QAction


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()     
                    
        self.setWindowTitle("JoaquimPad — Text Editor")
        self.resize(900, 600)
       
       
        self._cursor_history = []
        self._cursor_history_index = -1
        self._ignore_cursor_history = False

        self._tab_history = []
        self._history_index = -1
        self._ignore_history = False

        # ✅ 1. Cria o gerenciador de abas PRIMEIRO
        self.tabs = TabManager()
        self.setCentralWidget(self.tabs)

        # ✅ 2. Cria o menu (mantendo referência!)
        self.menu_builder = MenuBarBuilder(self)
        self.menu_builder.build()

        self.create_toolbar()
        
        # ✅ 3. Restaura sessão ou cria uma nova aba
        from core.session_manager import SessionManager
        session = SessionManager.load()

        if session:
            self.restore_session(session)
        else:
            self.tabs.new_tab()


        # =============================
        # SERVIÇOS / UI BASE
        # =============================
        self.file_service = FileService()

        self.tabs = TabManager()
        self.setCentralWidget(self.tabs)

        # ✅ Crie PRIMEIRO
        self.status_bar = StatusBar(self)
        self.setStatusBar(self.status_bar)

        self.status_controller = StatusController(self.status_bar)

        # ✅ DEPOIS conecte sinais
        self.tabs.currentChanged.connect(self.on_tab_changed)
          
        # =============================
        # Sessão
        # =============================
       
        session = SessionManager.load()

        if session:
            self.restore_session(session)
        else:
            self.tabs.new_tab()

    # ----------------------

    # ======================
    # Arquivo
    # ======================
    def restore_session(self, session: dict):
        tabs = session.get("tabs", [])

        for tab in tabs:
            editor = self.tabs.new_tab(tab["title"])
            editor.setPlainText(tab["content"])
            editor.file_path = tab.get("file_path")
        # -----------------------------
        # ✅ Focar na última aba usada
        # -----------------------------
        index = session.get("current_index", len(tabs) - 1)

        if 0 <= index < self.tabs.count():
            self.tabs.setCurrentIndex(index)

    def open_file(self, path: str):
        # Evita abrir o mesmo arquivo duas vezes
        for i in range(self.tabs.count()):
            editor = self.tabs.widget(i)
            if getattr(editor, "file_path", None) == path:
                self.tabs.setCurrentIndex(i)
                return

        try:
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            print("Erro ao abrir arquivo:", e)
            return

        editor = self.tabs.new_tab(path.split("/")[-1])
        editor.setPlainText(content)
        editor.file_path = path
        
    def on_tab_changed(self, index):
        editor = self.tabs.current_editor()
        if not editor:
            return

        # conecta mudança de cursor
        editor.cursorPositionChanged.connect(self._register_cursor_position)

        # registra posição inicial da aba
        self._register_cursor_position()

        # mantém status bar
        editor.set_word_wrap(editor.word_wrap_enabled)
        self.status_controller.connect_editor(editor)



    def new_file(self):
        print("NEW_FILE:", Settings.USE_DATETIME_TAB_NAME)

        if Settings.USE_DATETIME_TAB_NAME:
            name = Util.current_datetime_tab_name();

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
            return
        else:
            # ✅ config DESLIGADA → sempre cria nova aba
            self.tabs.new_tab(Util.current_datetime_tab_name())
                       
   
    def save_file(self):
        editor = self.tabs.current_editor()
        if editor is None:
            return

        path = getattr(editor, "file_path", None)

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
        if editor is None:
            return

        path, _ = QFileDialog.getSaveFileName(
            self,
            "Salvar como",
            "",
            "Arquivos de texto (*.txt);;Todos os arquivos (*)",
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

        # Atualiza o nome da aba
        self.tabs.setTabText(
            self.tabs.currentIndex(),
            path.split("/")[-1]
        )

        # Atualiza arquivos recentes
        from core.recent_files import RecentFiles
        RecentFiles.add(path)

        # Atualiza o menu
        if hasattr(self, "menu_builder"):
            self.menu_builder.update_recent_files_menu()

    # ======================
    # Editar
    # ======================
    def undo(self):
        self.tabs.current_editor().undo()

    def redo(self):
        self.tabs.current_editor().redo()

    def cut(self):
        self.tabs.current_editor().cut()

    def copy(self):
        self.tabs.current_editor().copy()

    def paste(self):
        self.tabs.current_editor().paste()

    def select_all(self):
        self.tabs.current_editor().selectAll()
    

    def closeEvent(self, event):
        """
        Salva a sessão atual ao fechar o JoaquimPad
        """
        try:
            SessionManager.save(
                self.tabs,
                self.tabs.currentIndex()
            )
            print("✅ Sessão salva com sucesso")
        except Exception as e:
            print("❌ Erro ao salvar sessão:", e)

        event.accept()
    def close_all_tabs(self):
        self.tabs.close_all_tabs()
            
    def open_find_replace(self):
        editor = self.tabs.current_editor()
        if not editor:
            return

        # ✅ manter referência para evitar GC
        if not hasattr(self, "_find_replace_dialog"):
            self._find_replace_dialog = FindReplaceDialog(editor, self)
        else:
            # se mudar de aba, atualiza o editor alvo
            self._find_replace_dialog.editor = editor

        self._find_replace_dialog.show()
        self._find_replace_dialog.raise_()
        self._find_replace_dialog.activateWindow()

        dialog = FindReplaceDialog(editor, self)
        dialog.show
    def close_current_tab(self):
        self.tabs.close_current_tab()

    def toggle_pin_current_tab(self):
        index = self.tabs.currentIndex()
        if index >= 0:
            self.tabs.toggle_pin(index)
    def restore_session(self, session: dict):
        tabs = session.get("tabs", [])
        if not tabs:
            self.tabs.new_tab()
            return

        # ✅ Separe pinadas e normais
        pinned_tabs = [t for t in tabs if t.get("is_pinned")]
        normal_tabs = [t for t in tabs if not t.get("is_pinned")]

        for tab in pinned_tabs + normal_tabs:
            editor = self.tabs.new_tab(
                tab["title"],
                pinned=tab.get("is_pinned", False)
            )
            editor.setPlainText(tab["content"])
            editor.file_path = tab.get("file_path")
            editor.is_pinned = tab.get("is_pinned", False)

        # ✅ Restaura foco
        index = session.get("current_index", len(tabs) - 1)
        if 0 <= index < self.tabs.count():
            self.tabs.setCurrentIndex(index)
            
    def go_back_tab(self):
        if self._cursor_history_index > 0:
            self._ignore_cursor_history = True
            self._cursor_history_index -= 1

            entry = self._cursor_history[self._cursor_history_index]
            editor = entry["editor"]
            pos = entry["position"]

            # muda para a aba correta
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
        
    def create_toolbar(self):
        toolbar = QToolBar("Navegação")
        toolbar.setMovable(False)
        self.addToolBar(toolbar)

        # -----------------------------
        # Voltar
        # -----------------------------
       
        back_action = QAction(QIcon("assets/icons/back.svg"), "", self)
        back_action.setToolTip("Voltar")
        back_action.triggered.connect(self.go_back_tab)
        toolbar.addAction(back_action)

        # -----------------------------
        # Avançar
        # -----------------------------        
        forward_action = QAction(QIcon("assets/icons/forward.svg"), "", self)
        forward_action.setToolTip("Avançar")
        forward_action.triggered.connect(self.go_forward_tab)
        toolbar.addAction(forward_action)

        toolbar.addSeparator()

        # -----------------------------
        # Nova aba
        # -----------------------------
        new_tab_action = QAction("+", self)
        new_tab_action.setToolTip("Nova aba")
        new_tab_action.triggered.connect(self.new_file)
        toolbar.addAction(new_tab_action)
    def toggle_word_wrap(self, checked: bool):
        editor = self.tabs.current_editor()
        if not editor:
            return

        editor.set_word_wrap(checked)
    def _register_cursor_position(self):
        if self._ignore_cursor_history:
            return

        editor = self.tabs.current_editor()
        if not editor:
            return

        cursor = editor.textCursor()
        pos = cursor.position()

        # evita duplicar posição
        if (
            self._cursor_history_index >= 0
            and self._cursor_history[self._cursor_history_index]["editor"] == editor
            and self._cursor_history[self._cursor_history_index]["position"] == pos
        ):
            return

        # remove "futuro" se navegar após voltar
        self._cursor_history = self._cursor_history[: self._cursor_history_index + 1]

        self._cursor_history.append({
            "editor": editor,
            "position": pos
        })

        self._cursor_history_index += 1