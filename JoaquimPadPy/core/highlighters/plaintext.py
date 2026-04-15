from PySide6.QtGui import QSyntaxHighlighter


class PlainTextHighlighter(QSyntaxHighlighter):
    language = "Plain Text"

    def __init__(self, document):
        super().__init__(document)

    def highlightBlock(self, text):
        # ❗ Obrigatório implementar
        # Plain text não tem formatação
        return