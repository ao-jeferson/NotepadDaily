import re
from .base import BaseHighlighter

class HtmlHighlighter(BaseHighlighter):
    def __init__(self, doc):
        super().__init__(doc)
        self.tag = self.make_format('#569CD6')
        self.attr = self.make_format('#9CDCFE')
        self.val = self.make_format('#CE9178')

    def highlightBlock(self, text):
        for m in re.finditer(r'<[^>]+>', text): self.setFormat(m.start(), m.end()-m.start(), self.tag)
        for m in re.finditer(r'\w+(?==)', text): self.setFormat(m.start(), m.end()-m.start(), self.attr)
        for m in re.finditer(r'".*?"', text): self.setFormat(m.start(), m.end()-m.start(), self.val)
