import re
from .base import BaseHighlighter


class JavaScriptHighlighter(BaseHighlighter):
    language = "JavaScript"

    def __init__(self, doc):
        super().__init__(doc)

        self.kw = self.make_format("#C586C0", True)
        self.strf = self.make_format("#CE9178")

        self.keywords = [
            "function", "return", "if", "else",
            "for", "while", "const", "let", "var",
            "class", "new"
        ]

    def highlightBlock(self, text):
        # keywords
        for kw in self.keywords:
            for m in re.finditer(rf"\b{kw}\b", text):
                self.setFormat(
                    m.start(),
                    len(kw),
                    self.kw
                )

        # strings (aspas simples e duplas)
        for m in re.finditer(r'".*?"|\'.*?\'', text):
            self.setFormat(
                m.start(),
                m.end() - m.start(),
                self.strf
            )