import subprocess
from .base_formatter import BaseFormatter


class PrettierFormatter(BaseFormatter):
    def __init__(self, language: str):
        self.language = language

    def format(self, text: str) -> str:
        process = subprocess.run(
            ["prettier", "--stdin-filepath", f"file.{self._ext()}"],
            input=text,
            text=True,
            capture_output=True
        )

        if process.returncode != 0:
            raise RuntimeError(process.stderr)

        return process.stdout

    def _ext(self):
        return {
            "JavaScript": "js",
            "JSON": "json",
            "HTML": "html"
        }.get(self.language, "txt")
