try:
    import black
except ImportError:
    black = None


class PythonFormatter:
    language = "Python"

    def format(self, text: str) -> str:
        if not black:
            # black não instalado → não formata, mas não quebra
            return text

        try:
            return black.format_str(
                text,
                mode=black.FileMode()
            )
        except Exception:
            return text