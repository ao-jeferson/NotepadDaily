import re
import keyword
from .base_formatter import BaseFormatter, CYAN, GREEN, GRAY, RESET

class PythonFormatter(BaseFormatter):
    def format_and_highlight(self, code: str) -> str:
        output = []

        for raw in code.splitlines():
            line = raw.strip()

            if line.startswith("#"):
                output.append(self.indent_line(f"{GRAY}{line}{RESET}"))
                continue

            if line.endswith(":"):
                colored = self.colorize_keywords(
                    line, keyword.kwlist, CYAN
                )
                output.append(self.indent_line(colored))
                self.indent_level += 1
                continue

            if line == "":
                output.append("")
                continue

            if re.match(r"(return|pass|break|continue)", line):
                self.indent_level = max(0, self.indent_level - 1)

            line = self.colorize_keywords(line, keyword.kwlist, CYAN)
            line = re.sub(r'".*?"|\'.*?\'',
                          lambda m: f"{GREEN}{m.group(0)}{RESET}", line)

            output.append(self.indent_line(line))

        return "\n".join(output)
