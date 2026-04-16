import re
from .base_formatter import BaseFormatter, MAGENTA, RESET

class SqlFormatter(BaseFormatter):
    KEYWORDS = [
        "select","from","where","insert","into","update","delete",
        "join","inner","left","right","on","group","order","by"
    ]

    def format_and_highlight(self, code: str) -> str:
        code = code.lower()
        code = re.sub(r",", ",\n", code)

        output = []
        for line in code.splitlines():
            line = line.strip()
            line = self.colorize_keywords(line, self.KEYWORDS, MAGENTA)
            output.append(self.indent_line(line))

        return "\n".join(output)