from PySide6.QtWidgets import QMainWindow, QFileDialog
from core.tab_manager import TabManager
from core.util import Util
from services.file_service import FileService
from ui.menu_bar import MenuBarBuilder
from ui.status_bar import StatusBar
from ui.status_controller import StatusController
from core.settings import Settings
from datetime import datetime
from PySide6.QtGui import QTextCursor
from core.session_manager import SessionManager
from ui.find_replace_dialog import FindReplaceDialog


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()     
                    
        self.setWindowTitle("JoaquimPad — Text Editor")
        self.resize(900, 600)

        # ✅ 1. Cria o gerenciador de abas PRIMEIRO
        self.tabs = TabManager()
        self.setCentralWidget(self.tabs)

        # ✅ 2. Cria o menu (mantendo referência!)
        self.menu_builder = MenuBarBuilder(self)
        self.menu_builder.build()

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
        
    def on_tab_changed(self):
            editor = self.tabs.current_editor()
            if editor:
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
        pinned_tabs = []
        normal_tabs = []

        for tab in session.get("tabs", []):
            if tab.get("is_pinned"):
                pinned_tabs.append(tab)
            else:
                normal_tabs.append(tab)

        for tab in pinned_tabs + normal_tabs:
            editor = self.tabs.new_tab(tab["title"], pinned=tab.get("is_pinned", False))
            editor.setPlainText(tab["content"])
            editor.file_path = tab.get("file_path")
            editor.is_pinned = tab.get("is_pinned", False)

        index = session.get("current_index", len(pinned_tabs + normal_tabs) - 1)
        if 0 <= index < self.tabs.count():
            self.tabs.setCurrentIndex(index)
