import json
import re
from .base_formatter import BaseFormatter, GREEN, CYAN, RESET

class JsonFormatter(BaseFormatter):
    def format_and_highlight(self, code: str) -> str:
        parsed = json.loads(code)
        pretty = json.dumps(parsed, indent=4, ensure_ascii=False)
        output = []

        for line in pretty.splitlines():
            line = re.sub(r'".*?"(?=:)',
                          lambda m: f"{CYAN}{m.group(0)}{RESET}", line)
            line = re.sub(r'\b\d+\b',
                          lambda m: f"{GREEN}{m.group(0)}{RESET}", line)
            output.append(line)

        return "\n".join(output)
