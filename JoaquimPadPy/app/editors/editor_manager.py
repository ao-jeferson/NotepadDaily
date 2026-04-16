from datetime import datetime
from PyQt6.QtWidgets import QTabWidget

from app.editors.editor import Editor


class EditorManager(QTabWidget):
    def __init__(self, settings):
        super().__init__()
        self.settings = settings   # ✅ NÃO chamar

        self.setTabsClosable(True)
        self.tabCloseRequested.connect(self.close_tab)


    def _generate_title(self) -> str:
        now = datetime.now()
        return now.strftime("%d-%m %H:%M")

    def _find_tab_by_title(self, title: str):
        for i in range(self.count()):
            if self.tabText(i) == title:
                return i
        return None

    def new_editor(self, title: str | None = None):
        if title is None:
            title = self._generate_title()

            if self.settings.allow_same_name_append:
                existing_index = self._find_tab_by_title(title)
                if existing_index is not None:
                    self.setCurrentIndex(existing_index)
                    editor = self.currentWidget()
                    editor.moveCursorToEnd()
                    return

        editor = Editor()
        index = self.addTab(editor, title)
        self.setCurrentIndex(index)

    def close_tab(self, index: int):
        self.removeTab(index)

    def current_editor(self):
        return self.currentWidget()
