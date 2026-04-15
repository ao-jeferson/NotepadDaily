from PySide6.QtWidgets import QTabWidget
from core.editor_widget import EditorWidget


class TabManager(QTabWidget):
    def __init__(self):
        super().__init__()
        self.setTabsClosable(True)
        self.tabCloseRequested.connect(self.close_tab)

    def new_tab(self, title="Novo Documento"):
        editor = EditorWidget()
        index = self.addTab(editor, title)
        self.setCurrentIndex(index)
        return editor

    def close_tab(self, index):
        self.removeTab(index)

    def current_editor(self):
        return self.currentWidget()