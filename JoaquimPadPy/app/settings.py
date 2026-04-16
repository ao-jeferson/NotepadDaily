from PyQt6.QtCore import QObject, pyqtSignal

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