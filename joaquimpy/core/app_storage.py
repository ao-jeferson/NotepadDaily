from pathlib import Path


class AppStorage:
    APP_NAME = "JoaquimPad"

    @staticmethod
    def app_dir() -> Path:
        base = Path.home() / f".{AppStorage.APP_NAME.lower()}"
        base.mkdir(exist_ok=True)
        return base

    @staticmethod
    def recent_files_path() -> Path:
        return AppStorage.app_dir() / "recent_files.json"