import re
from .base_formatter import BaseFormatter, YELLOW, GREEN, GRAY, RESET

class JavaScriptFormatter(BaseFormatter):
    KEYWORDS = [
        "function","const","let","var","return",
        "if","else","for","while","class","new"
    ]

    def format_and_highlight(self, code: str) -> str:
        output = []

        for raw in code.splitlines():
            line = raw.strip()

            if line.startswith("//"):
                output.append(self.indent_line(f"{GRAY}{line}{RESET}"))
                continue

            if "}" in line:
                self.indent_level = max(0, self.indent_level - 1)

            line = self.colorize_keywords(line, self.KEYWORDS, YELLOW)
            line = re.sub(r'".*?"|\'.*?\'',
                          lambda m: f"{GREEN}{m.group(0)}{RESET}", line)

            output.append(self.indent_line(line))

            if "{" in line:
                self.indent_level += 1

        return "\n".join(output)