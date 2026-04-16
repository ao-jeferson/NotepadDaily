class BaseFormatter:
    language = "Plain Text"

    def format(self, text: str) -> str:
        """
        Recebe texto e retorna texto formatado.
        Deve lançar exceção se falhar.
        """
        raise NotImplementedError