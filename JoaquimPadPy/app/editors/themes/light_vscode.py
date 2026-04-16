from PyQt6.QtGui import QFont, QColor
from PyQt6.Qsci import QsciScintilla

from .base_theme import BaseTheme


class LightVSCodeTheme(BaseTheme):
    name = "VS Code Light"

    def apply(self, editor: QsciScintilla):

        # Fonte
        font = QFont("Consolas", 11)
        font.setFixedPitch(True)

        editor.setFont(font)
        editor.setMarginsFont(font)

        # Fundo e texto
        editor.setPaper(QColor("#ffffff"))
        editor.setColor(QColor("#000000"))

        # Margem de linhas (estreita)
        editor.setMarginType(0, QsciScintilla.MarginType.NumberMargin)
        editor.setMarginWidth(0, "99")
        editor.setMarginsBackgroundColor(QColor("#f3f3f3"))
        editor.setMarginsForegroundColor(QColor("#6a6a6a"))

        # Linha atual
        editor.setCaretLineVisible(True)
        editor.setCaretLineBackgroundColor(QColor("#eaeaea"))

        # Cursor
        editor.setCaretForegroundColor(QColor("#000000"))

        # Seleção
        editor.setSelectionBackgroundColor(QColor("#add6ff"))

        # Indentação
        editor.setTabWidth(4)
        editor.setIndentationGuides(True)

        # Quebra de linha (igual VS Code)
        editor.setWrapMode(QsciScintilla.WrapMode.WrapWord)