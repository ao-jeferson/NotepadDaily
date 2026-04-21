from PySide6.QtGui import QSyntaxHighlighter, QTextCharFormat, QColor, QFont

class BaseHighlighter(QSyntaxHighlighter):
    def make_format(self, color, bold=False):
        fmt = QTextCharFormat()
        fmt.setForeground(QColor(color))
        if bold:
            fmt.setFontWeight(QFont.Bold)
        return fmt
