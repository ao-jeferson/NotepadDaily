import re
from .base import BaseHighlighter

class MarkdownHighlighter(BaseHighlighter):
    def __init__(self, doc):
        super().__init__(doc)
        self.h = self.make_format('#569CD6', True)
        self.b = self.make_format('#DCDCAA', True)
        self.c = self.make_format('#CE9178')

    def highlightBlock(self, text):
        if text.startswith('#'): self.setFormat(0, len(text), self.h)
        for m in re.finditer(r'\*\*.*?\*\*', text): self.setFormat(m.start(), m.end()-m.start(), self.b)
        for m in re.finditer(r'`.*?`', text): self.setFormat(m.start(), m.end()-m.start(), self.c)
