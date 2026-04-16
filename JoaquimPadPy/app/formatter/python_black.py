import subprocess
from .base_formatter import BaseFormatter


class PythonBlackFormatter(BaseFormatter):
    language = "Python"

    def format(self, text: str) -> str:
        process = subprocess.run(
            ["black", "-q", "-"],
            input=text,
            text=True,
            capture_output=True
        )

        if process.returncode != 0:
            raise RuntimeError(process.stderr)

        return process.stdout