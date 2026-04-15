import jsbeautifier
from core.formatters.base import BaseFormatter


class JavaScriptFormatter(BaseFormatter):
    language = "JavaScript"

    def format(self, text: str) -> str:
        return jsbeautifier.beautify(text)