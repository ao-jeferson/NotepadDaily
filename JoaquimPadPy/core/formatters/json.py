import json
from core.formatters.base import BaseFormatter


class JsonFormatter(BaseFormatter):
    language = "JSON"

    def format(self, text: str) -> str:
        return json.dumps(json.loads(text), indent=2)