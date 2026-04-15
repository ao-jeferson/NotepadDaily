
from PySide6.QtWidgets import QMainWindow, QFileDialog
from core.tab_manager import TabManager
from services.file_service import FileService
from ui.menu_bar import MenuBarBuilder
from ui.status_bar import StatusBar
from ui.status_controller import StatusController


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("JoaquimPad — Text Editor")
        self.resize(1000, 650)

        self.file_service = FileService()

        self.tabs = TabManager()
        self.setCentralWidget(self.tabs)
        
        # self.status_bar = StatusBar(self)
        # self.setStatusBar(self.status_bar)


        MenuBarBuilder(self).build()       
        
        self.tabs.currentChanged.connect(self.on_tab_changed)
        self.tabs.new_tab()

        self.status_bar = StatusBar(self)
        self.setStatusBar(self.status_bar)
        self.status_controller = StatusController(self.status_bar)
    # ======================
    # Arquivo
    # ======================
    
    def on_tab_changed(self):
            editor = self.tabs.current_editor()
            if editor:
                self.status_controller.connect_editor(editor)

    def new_file(self):
        self.tabs.new_tab()

    def open_file(self):
        path, _ = QFileDialog.getOpenFileName(
            self, "Abrir arquivo", "", "Text Files (*.txt);;All Files (*)"
        )
        if path:
            content = self.file_service.open_file(path)
            editor = self.tabs.new_tab(title=path.split("/")[-1])
            editor.setPlainText(content)
            editor.file_path = path 
            
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