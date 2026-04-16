import sys
from PySide6.QtWidgets import QApplication
from app.bootstrap import bootstrap
from ui.main_window import MainWindow

def main():
    container = bootstrap()
    app = QApplication(sys.argv)
    window = MainWindow(container)
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
