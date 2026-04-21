from PySide6.QtGui import QSyntaxHighlighter, QTextCharFormat, QColor, QFont

# ============================
# Cores ANSI (para formatter CLI)
# ============================
RESET = "\033[0m"
BLUE = "\033[94m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
MAGENTA = "\033[95m"
RED = "\033[91m"
GRAY = "\033[90m"


class BaseFormatter:
    """
    Base para formatters de texto.
    NÃO conhece Qt.
    """

    INDENT = "    "

    def format(self, text: str) -> str:
        """
        Deve ser sobrescrito.
        """
        return text


class BaseHighlighter(QSyntaxHighlighter):
    """
    Base para syntax highlighters Qt.
    """

    def _format(self, color: QColor, bold: bool = False) -> QTextCharFormat:
        fmt = QTextCharFormat()
        fmt.setForeground(color)
        if bold:
            fmt.setFontWeight(QFont.Bold)
        return fmt