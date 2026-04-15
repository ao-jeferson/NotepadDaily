import json
from core.app_storage import AppStorage

class SessionManager:
    SESSION_FILE = "session.json"

    @staticmethod
    def _session_path():
        return AppStorage.app_dir() / SessionManager.SESSION_FILE

    @staticmethod
    def save(tabs, current_index: int):
        session = {
            "current_index": current_index,
            "tabs": []
        }

        for i in range(tabs.count()):
            editor = tabs.widget(i)

            session["tabs"].append({
                "title": tabs.tabText(i).replace("📌 ", ""),
                "file_path": editor.file_path,
                "content": editor.toPlainText(),
                "is_pinned": editor.is_pinned  # ✅ SALVA PIN
            })

        path = SessionManager._session_path()
        path.write_text(
            json.dumps(session, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )

    @staticmethod
    def load():
        path = SessionManager._session_path()
        if not path.exists():
            return None

        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return None