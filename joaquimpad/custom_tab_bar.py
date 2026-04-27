from PyQt5.QtWidgets import QTabBar
from PyQt5.QtCore import Qt


class CustomTabBar(QTabBar):
    def __init__(self, main_window, parent=None):
        super().__init__(parent)
        self.main_window = main_window

    def mousePressEvent(self, event):
        if event.button() == Qt.MiddleButton:
            tab_index = self.tabAt(event.pos())
            if tab_index >= 0:
                self.main_window.close_tab(tab_index)
        else:
            super().mousePressEvent(event)
