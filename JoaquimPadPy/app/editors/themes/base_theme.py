from PyQt6.Qsci import QsciScintilla


class BaseTheme:
    """
    Contrato de tema para o Editor.
    """

    name = "Base"

    def apply(self, editor: QsciScintilla):
        """
        Aplica o tema no editor.
        Deve ser implementado por temas concretos.
        """
        raise NotImplementedError