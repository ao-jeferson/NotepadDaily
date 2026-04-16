from PyQt6.QtGui import QFont, QColor
from PyQt6.Qsci import QsciScintilla

from .base_theme import BaseTheme


class WhiteBlueVSCodeTheme(BaseTheme):
    name = "White Blue (VS Code)"

    def apply(self, editor: QsciScintilla):
        # Fonte
        font = QFont("Consolas", 11)
        font.setFixedPitch(True)

        editor.setFont(font)
        editor.setMarginsFont(font)

        # Fundo e texto
        editor.setPaper(QColor("#ffffff"))
        editor.setColor(QColor("#001080"))

        # Margem de linhas (estreita)
        editor.setMarginType(0, QsciScintilla.MarginType.NumberMargin)
        editor.setMarginWidth(0, "99")
        editor.setMarginsBackgroundColor(QColor("#eff3f7"))
        editor.setMarginsForegroundColor(QColor("#6b6b6b"))

        # Linha atual
        editor.setCaretLineVisible(True)
        editor.setCaretLineBackgroundColor(QColor("#e7f3ff"))

        # Cursor
        editor.setCaretForegroundColor(QColor("#000000"))

        # Seleção
        editor.setSelectionBackgroundColor(QColor("#cce5ff"))
        editor.setSelectionForegroundColor(QColor("#000000"))

        # Indentação
        editor.setTabWidth(4)
        editor.setIndentationGuides(True)

        # Word wrap (sem scroll horizontal)
        editor.setWrapMode(QsciScintilla.WrapMode.WrapWord)