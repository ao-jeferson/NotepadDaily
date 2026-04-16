from PyQt6.QtCore import QObject, pyqtSignal

from app.menus.config_menu import ConfigMenu
from app.menus.file_menu import FileMenu

class AppSettings(QObject):
    allow_same_name_append_changed = pyqtSignal(bool)

    def __init__(self):
        super().__init__()
        self._allow_same_name_append = False

    @property
    def allow_same_name_append(self) -> bool:
        return self._allow_same_name_append

    @allow_same_name_append.setter
    def allow_same_name_append(self, value: bool):
        if self._allow_same_name_append != value:
            self._allow_same_name_append = value
            self.allow_same_name_append_changed.emit(value)

    
    def _create_menus(self):
        menu_bar = self.menuBar()
        menu_bar.addMenu(FileMenu(self.signals, self))
        menu_bar.addMenu(ConfigMenu(self.settings, self))
