import re
from .base import BaseHighlighter

class SqlHighlighter(BaseHighlighter):
    def __init__(self, doc):
        super().__init__(doc)
        self.kw = self.make_format('#569CD6', True)
        self.keywords=['select','from','where','insert','into','update','delete','join','on','group','order','by']

    def highlightBlock(self, text):
        for k in self.keywords:
            for m in re.finditer(rf'{k}', text, re.IGNORECASE): self.setFormat(m.start(), len(k), self.kw)
