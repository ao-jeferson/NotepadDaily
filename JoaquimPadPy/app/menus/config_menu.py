from PyQt6.QtGui import QAction
from PyQt6.QtWidgets import QMenu

from app import settings

class ConfigMenu(QMenu):
    def __init__(self, parent=None):
        super().__init__("Configuração", parent)
        self.settings = settings()

        self._create_actions()

    def _create_actions(self):
        self.allow_same_name_action = QAction(
            "Permitir gravar arquivos com nomes iguais",
            self,
            checkable=True
        )
        self.allow_same_name_action.setChecked(
            self.settings.allow_same_name_append
        )

        self.allow_same_name_action.toggled.connect(
            self._on_toggle
        )

        self.addAction(self.allow_same_name_action)

    def _on_toggle(self, checked: bool):
        self.settings.allow_same_name_append = checked
