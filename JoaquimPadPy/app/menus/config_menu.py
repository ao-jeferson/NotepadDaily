from PyQt6.QtGui import QAction
from PyQt6.QtWidgets import QMenu

class ConfigMenu(QMenu):
    def __init__(self, settings, parent=None):
        super().__init__("Configurações", parent)
        self.settings = settings
        self._create_actions()

    def _create_actions(self):
        self.allow_same_name_action = QAction(
            "Permitir criar arquivos com o mesmo nome",
            self,
            checkable=True
        )

        # Estado inicial
        self.allow_same_name_action.setChecked(
            self.settings.allow_same_name_append
        )

        # Quando o usuário clicar
        self.allow_same_name_action.toggled.connect(
            self._on_toggle
        )

        self.addAction(self.allow_same_name_action)

    def _on_toggle(self, checked: bool):
        self.settings.allow_same_name_append = checked