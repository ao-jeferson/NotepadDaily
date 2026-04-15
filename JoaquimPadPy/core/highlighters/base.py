from PySide6.QtGui import QSyntaxHighlighter, QTextCharFormat, QColor


class BaseHighlighter(QSyntaxHighlighter):
    language = "Plain Text"

    def __init__(self, document):
        super().__init__(document)

    def format(self, color, bold=False):
        fmt = QTextCharFormat()
        fmt.setForeground(QColor(color))
        if bold:
            fmt.setFontWeight(600)
        return fmt