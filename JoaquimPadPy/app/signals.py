from PyQt6.QtCore import QObject, pyqtSignal

class AppSignals(QObject):
    new_file = pyqtSignal()
    open_file = pyqtSignal()
    save_file = pyqtSignal()
    save_as_file = pyqtSignal()