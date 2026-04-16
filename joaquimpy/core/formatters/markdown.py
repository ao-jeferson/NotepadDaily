import re
from .base_formatter import BaseFormatter, MAGENTA, CYAN, GREEN, RESET

class MarkdownFormatter(BaseFormatter):
    def format_and_highlight(self, code: str) -> str:
        output = []

        for line in code.splitlines():
            if line.startswith("#"):
                output.append(f"{MAGENTA}{line}{RESET}")
            else:
                line = re.sub(r"\*\*.*?\*\*",
                              lambda m: f"{GREEN}{m.group(0)}{RESET}", line)
                line = re.sub(r"`.*?`",
                              lambda m: f"{CYAN}{m.group(0)}{RESET}", line)
                output.append(line)

        return "\n".join(output)
