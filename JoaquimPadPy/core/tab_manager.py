from PySide6.QtWidgets import QTabWidget
from core.editor_widget import EditorWidget
from core.settings import Settings
from core.util import Util

class TabManager(QTabWidget):
    def __init__(self):
        super().__init__()
        
        #✅ Permite fechar abas
        self.setTabsClosable(True)
        self.tabCloseRequested.connect(self.close_tab)


    # ✅ Permite reordenar abas com drag & drop
        self.setMovable(True)
        # (equivalente a: self.tabBar().setMovable(True))

    def new_tab(self, title= Util.current_datetime_tab_name()):
        editor = EditorWidget()
        index = self.addTab(editor, title)
        self.setCurrentIndex(index)
        return editor

    def close_tab(self, index):
        self.removeTab(index)

    def current_editor(self):
        return self.currentWidget()

    def find_tab_by_title(self, title):
        for i in range(self.count()):
            if self.tabText(i) == title:
                return i
        return None