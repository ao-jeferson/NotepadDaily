from PyQt6.QtGui import QAction
from PyQt6.QtWidgets import QMenu

class FileMenu(QMenu):
    def __init__(self, signals, parent=None):
        super().__init__("Arquivo", parent)

        self.signals = signals
        self._create_actions()

    def _create_actions(self):
        new_action = QAction("Novo", self)
        new_action.triggered.connect(self.signals.new_file)

        open_action = QAction("Abrir...", self)
        open_action.triggered.connect(self.signals.open_file)

        save_action = QAction("Salvar", self)
        save_action.triggered.connect(self.signals.save_file)

        save_as_action = QAction("Salvar como...", self)
        save_as_action.triggered.connect(self.signals.save_as_file)

        self.addActions([
            new_action,
            open_action,
            save_action,
            save_as_action
        ])