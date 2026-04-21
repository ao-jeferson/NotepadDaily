import re
from .base import BaseHighlighter

class CSharpHighlighter(BaseHighlighter):
    def __init__(self, doc):
        super().__init__(doc)
        self.kw = self.make_format('#569CD6', True)
        self.strf = self.make_format('#CE9178')
        self.keywords=['class','public','private','protected','static','void','int','string','return','if','else','for','while','new']

    def highlightBlock(self, text):
        for k in self.keywords:
            for m in re.finditer(rf'{k}', text): self.setFormat(m.start(), len(k), self.kw)
        for m in re.finditer(r'".*?"', text): self.setFormat(m.start(), m.end()-m.start(), self.strf)
