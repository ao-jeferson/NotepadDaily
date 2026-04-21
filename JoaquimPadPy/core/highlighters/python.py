import re
from .base import BaseHighlighter

class PythonHighlighter(BaseHighlighter):
    def __init__(self, doc):
        super().__init__(doc)
        self.kw = self.make_format('#569CD6', True)
        self.strf = self.make_format('#CE9178')
        self.cmt = self.make_format('#6A9955')
        self.keywords = ['def','class','return','if','else','elif','for','while','import','from','as','pass','break','continue']

    def highlightBlock(self, text):
        for k in self.keywords:
            for m in re.finditer(rf'{k}', text): self.setFormat(m.start(), len(k), self.kw)
        for m in re.finditer(r'".*?"|\'.*?\'', text):self.setFormat(m.start(),m.end() - m.start(),self.strf)
        if '#' in text:
            i=text.index('#'); self.setFormat(i, len(text)-i, self.cmt)
