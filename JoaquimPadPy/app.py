import sys
from PySide6.QtWidgets import QApplication
from main_window import MainWindow
from core.recent_files import RecentFiles

def main():
    
    RecentFiles.load()
    app = QApplication(sys.argv)

    with open("themes/dark.qss") as f:
        app.setStyleSheet(f.read())
    
    RecentFiles.load()
    window = MainWindow()
    window.show()

    sys.exit(app.exec())

if __name__ == "__main__":
    main()