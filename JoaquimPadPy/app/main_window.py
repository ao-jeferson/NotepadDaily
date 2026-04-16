from PyQt6.QtWidgets import QMainWindow 
from app.settings import AppSettings
from app.signals import AppSignals
from .editors.editor_manager import EditorManager
from .menus.file_menu import FileMenu
from .actions.file_actions import FileActions

class MainWindow(QMainWindow):
    def __init__(self):
        print("MainWindow criada")
        super().__init__()
        self.settings = AppSettings()
        
        self.setWindowTitle("joaquimPad")
        self.resize(1000, 700)

        self.signals = AppSignals()

        self.editor_manager = EditorManager(self.settings)
        self.setCentralWidget(self.editor_manager)

        self.file_actions = FileActions(
            self.editor_manager, parent=self
        )

        self._connect_signals()
        self._create_menus()

        self.editor_manager.new_editor()

    def _create_menus(self):
        menu_bar = self.menuBar()
        menu_bar.addMenu(FileMenu(self.signals, self))

    def _connect_signals(self):
        self.signals.new_file.connect(self.file_actions.new_file)
        self.signals.open_file.connect(self.file_actions.open_file)
        self.signals.save_file.connect(self.file_actions.save_file)
        self.signals.save_as_file.connect(self.file_actions.save_as_file)