from pathlib import Path


EXTENSION_LANGUAGE_MAP = {
    ".py": "Python",
    ".cs": "C#",
    ".js": "JavaScript",
    ".json": "JSON",
    ".md": "Markdown",
    ".txt": "Plain Text",
}


def detect_language_from_path(path: str) -> str:
    ext = Path(path).suffix.lower()
    return EXTENSION_LANGUAGE_MAP.get(ext, "Plain Text")