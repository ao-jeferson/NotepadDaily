import re
from .base import BaseHighlighter

class JsonHighlighter(BaseHighlighter):
    def __init__(self, doc):
        super().__init__(doc)
        self.key = self.make_format('#9CDCFE')
        self.num = self.make_format('#B5CEA8')
        self.strf = self.make_format('#CE9178')

    def highlightBlock(self, text):
        for m in re.finditer(r'".*?"(?=\s*:)', text): self.setFormat(m.start(), m.end()-m.start(), self.key)
        for m in re.finditer(r'".*?"', text): self.setFormat(m.start(), m.end()-m.start(), self.strf)
        for m in re.finditer(r'\d+', text): self.setFormat(m.start(), m.end()-m.start(), self.num)
