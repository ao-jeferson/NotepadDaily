def get_vscode_theme():
    """Returns VS Code-like white and blue theme stylesheet."""
    return """
        QMainWindow {
            background-color: #FFFFFF;
        }
        QToolBar {
            background-color: #3C3C3C;
            border: none;
            spacing: 3px;
        }
        QToolBar QPushButton {
            background-color: #3C3C3C;
            color: #FFFFFF;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
        }
        QToolBar QPushButton:hover {
            background-color: #505050;
        }
        QTabWidget::pane {
            border: 1px solid #E0E0E0;
            background-color: #FFFFFF;
        }
        QTabBar::tab {
            background-color: #E8E8E8;
            color: #333333;
            padding: 8px 16px;
            border: 1px solid #D0D0D0;
            border-bottom: none;
            margin-right: 2px;
        }
        QTabBar::tab:selected {
            background-color: #FFFFFF;
            color: #007ACC;
            border-bottom: 1px solid #FFFFFF;
        }
        QTabBar::tab:hover:!selected {
            background-color: #F0F0F0;
        }
        QStatusBar {
            background-color: #007ACC;
            color: #FFFFFF;
        }
        QStatusBar QLabel {
            color: #FFFFFF;
        }
        QMenuBar {
            background-color: #3C3C3C;
            color: #FFFFFF;
        }
        QMenuBar::item {
            background-color: transparent;
            padding: 5px 10px;
        }
        QMenuBar::item:selected {
            background-color: #505050;
        }
        QMenu {
            background-color: #252526;
            color: #CCCCCC;
            border: 1px solid #454545;
        }
        QMenu::item {
            padding: 5px 30px;
        }
        QMenu::item:selected {
            background-color: #094771;
        }
        QSplitter::handle {
            background-color: #E0E0E0;
            width: 1px;
        }
        QTreeWidget {
            background-color: #FFFFFF;
            border: none;
            font-size: 13px;
        }
        QTreeWidget::item {
            padding: 3px;
        }
        QTreeWidget::item:hover {
            background-color: #E8F4FD;
        }
        QTreeWidget::item:selected {
            background-color: #094771;
            color: #FFFFFF;
        }
        QTreeWidget::header {
            background-color: #F3F3F3;
            border: none;
            border-bottom: 1px solid #E0E0E0;
            padding: 5px;
        }
    """
