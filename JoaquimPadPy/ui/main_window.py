import sys
import os

# Garante que a raiz do projeto esteja no path
ROOT_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from PySide6.QtWidgets import QApplication
from app.bootstrap import bootstrap
from ui.main_window import MainWindow


def main():

    container = bootstrap()

    app = QApplication(sys.argv)

    window = MainWindow(container)
    window.setWindowTitle("JoaquimPad")

    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()