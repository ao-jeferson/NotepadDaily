import os
from PyQt5.QtWidgets import QWidget, QVBoxLayout, QTreeWidget, QTreeWidgetItem
from PyQt5.QtCore import Qt


class FileExplorer(QWidget):
    def __init__(self, main_window, parent=None):
        super().__init__(parent)
        self.main_window = main_window
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        
        self.tree = QTreeWidget()
        self.tree.setHeaderLabel("File Explorer")
        self.tree.itemDoubleClicked.connect(self.on_item_double_clicked)
        self.layout.addWidget(self.tree)
        
        # Defer loading directory until icons are available
        self.directory_to_load = os.path.dirname(os.path.abspath(__file__))

    def load_directory(self, path):
        self.tree.clear()
        root = QTreeWidgetItem(self.tree)
        root.setText(0, os.path.basename(path) or path)
        root.setData(0, Qt.UserRole, path)
        root.setExpanded(True)
        
        self.populate_tree(root, path)

    def populate_tree(self, parent_item, path):
        try:
            for item in sorted(os.listdir(path)):
                full_path = os.path.join(path, item)
                tree_item = QTreeWidgetItem(parent_item)
                tree_item.setText(0, item)
                tree_item.setData(0, Qt.UserRole, full_path)
                
                if os.path.isdir(full_path):
                    tree_item.setIcon(0, self.main_window.get_icon_for_directory())
                    self.populate_tree(tree_item, full_path)
                else:
                    tree_item.setIcon(0, self.main_window.get_icon_for_file(full_path))
        except PermissionError:
            pass

    def on_item_double_clicked(self, item, column):
        path = item.data(0, Qt.UserRole)
        if os.path.isfile(path):
            self.main_window.open_file(path)
