from PySide6.QtWidgets import (
    QWidget,
    QVBoxLayout,
    QTreeView,
    QFileSystemModel,
)
from PySide6.QtCore import Qt, Signal
from pathlib import Path


class FileExplorer(QWidget):

    file_open_requested = Signal(str)

    def __init__(self, parent=None):
        super().__init__(parent)

        self.model = QFileSystemModel()
        self.model.setRootPath("")

        self.tree = QTreeView()
        self.tree.setModel(self.model)

        # Mostrar apenas nome
        self.tree.setColumnWidth(0, 250)

        # Ocultar colunas extras
        self.tree.hideColumn(1)
        self.tree.hideColumn(2)
        self.tree.hideColumn(3)

        self.tree.doubleClicked.connect(
            self._on_double_click
        )

        layout = QVBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(self.tree)

        self.setLayout(layout)

    # ============================
    # Abrir pasta
    # ============================

    def open_folder(self, path: str):
        index = self.model.setRootPath(path)
        self.tree.setRootIndex(index)

    # ============================
    # Duplo clique
    # ============================

    def _on_double_click(self, index):
        path = self.model.filePath(index)

        if Path(path).is_file():
            self.file_open_requested.emit(path)