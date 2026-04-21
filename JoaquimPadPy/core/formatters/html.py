import re
from .base_formatter import (
    BaseFormatter,
    BLUE,
    YELLOW,
    GREEN,
    GRAY,
    RESET
)

class HtmlFormatter(BaseFormatter):
    SELF_CLOSING = ["br", "hr", "img", "input", "meta", "link"]

    def format_and_highlight(self, code: str) -> str:
        output = []

        # normaliza para facilitar parsing
        code = re.sub(r">\s*<", ">\n<", code)

        for raw in code.splitlines():
            line = raw.strip()

            # comentário HTML
            if line.startswith("<!--"):
                output.append(self.indent_line(f"{GRAY}{line}{RESET}"))
                continue

            # fechamento de tag
            if re.match(r"</\w+", line):
                self.indent_level = max(0, self.indent_level - 1)

            # aplica highlight
            highlighted = self.highlight_html(line)
            output.append(self.indent_line(highlighted))

            # abertura de tag (não self-closing)
            opened = re.match(r"<(\w+)", line)
            if opened:
                tag = opened.group(1)
                is_self_closing = (
                    tag.lower() in self.SELF_CLOSING or line.endswith("/>")
                )
                if not line.startswith("</") and not is_self_closing:
                    self.indent_level += 1

        return "\n".join(output)

    def highlight_html(self, line: str) -> str:
        # comentários
        line = re.sub(
            r"(<!--.*?-->)",
            f"{GRAY}\\1{RESET}",
            line
        )

        # valores de atributos
        line = re.sub(
            r'=".*?"',
            lambda m: f"={GREEN}{m.group(0)[1:]}{RESET}",
            line
        )

        # atributos
        line = re.sub(
            r"\b([\w-]+)(=)",
            f"{YELLOW}\\1{RESET}=",
            line
        )

        # tags
        line = re.sub(
            r"</?\w+",
            lambda m: f"{BLUE}{m.group(0)}{RESET}",
            line
        )

        line = re.sub(
            r">",
            f"{BLUE}>{RESET}",
            line
        )

        return line
