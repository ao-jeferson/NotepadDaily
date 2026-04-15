import json
from pathlib import Path
from core.app_storage import AppStorage


class RecentFiles:
    MAX_ITEMS = 15
    _files: list[str] = []

    # ============================
    # API pública
    # ============================
    @classmethod
    def load(cls):
        path = AppStorage.recent_files_path()

        if not path.exists():
            cls._files = []
            return

        try:
            cls._files = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            cls._files = []

    @classmethod
    def save(cls):
        path = AppStorage.recent_files_path()
        path.write_text(
            json.dumps(cls._files, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    @classmethod
    def add(cls, file_path: str):
        if file_path in cls._files:
            cls._files.remove(file_path)

        cls._files.insert(0, file_path)
        cls._files = cls._files[: cls.MAX_ITEMS]

        cls.save()

    @classmethod
    def list(cls) -> list[str]:
        return cls._files.copy()
    @classmethod
    def clear(cls):
        cls._files = []
        cls.save()