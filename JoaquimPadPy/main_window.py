
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

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        
        self.setWindowTitle("JoaquimPad — Text Editor")
        self.resize(1000, 650)

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

        # ✅ Menus        
        self.menu_builder = MenuBarBuilder(self)
        self.menu_builder.build()


        # ✅ Só agora crie a primeira aba
        self.tabs.new_tab()

    # ----------------------

    # ======================
    # Arquivo
    # ======================
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
        if editor.file_path:
            self.file_service.save_file(editor.file_path, editor.toPlainText())
        else:
            self.save_file_as()

    def save_file_as(self):
        editor = self.tabs.current_editor()
        path, _ = QFileDialog.getSaveFileName(
            self, "Salvar arquivo", "", "Text Files (*.txt);;All Files (*)"
        )
        if path:
            self.file_service.save_file(path, editor.toPlainText())
            editor.file_path = path
            self.tabs.setTabText(
                self.tabs.currentIndex(), path.split("/")[-1]
            )

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