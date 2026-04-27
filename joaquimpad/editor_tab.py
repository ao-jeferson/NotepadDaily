import os
from datetime import datetime
from PyQt5.QtWidgets import QWidget, QVBoxLayout
from PyQt5.QtCore import QTimer
from editor_widget import MonacoEditorWidget


class EditorTab(QWidget):
    def __init__(self, file_path=None, parent=None):
        super().__init__(parent)
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        
        self.file_path = file_path
        self.is_pinned = False
        self.navigation_history = []
        self.current_history_index = -1
        
        self.editor = MonacoEditorWidget()
        self.editor.cursor_moved.connect(self.on_cursor_moved)
        self.layout.addWidget(self.editor)
        
        # Delay content loading to ensure Monaco is ready
        if file_path and os.path.exists(file_path):
            QTimer.singleShot(500, self.load_file_content)

    def on_cursor_moved(self, line, column):
        # Track cursor position history
        position = {'line': line, 'column': column}
        
        # Remove any positions after current index
        if self.current_history_index < len(self.navigation_history) - 1:
            self.navigation_history = self.navigation_history[:self.current_history_index + 1]
        
        # Add new position if different from last
        if not self.navigation_history or self.navigation_history[-1] != position:
            self.navigation_history.append(position)
            self.current_history_index = len(self.navigation_history) - 1

    def load_file_content(self):
        if self.file_path and os.path.exists(self.file_path):
            # Try to read file with different encodings
            content = None
            encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
            
            for encoding in encodings:
                try:
                    with open(self.file_path, 'r', encoding=encoding) as f:
                        content = f.read()
                    break
                except UnicodeDecodeError:
                    continue
            
            if content is None:
                content = ""
            
            language = self.get_language_from_extension(self.file_path)
            # Delay to ensure Monaco is ready
            QTimer.singleShot(1500, lambda: self.editor.set_content(content, language))

    def navigate_back(self):
        if self.current_history_index > 0:
            self.current_history_index -= 1
            position = self.navigation_history[self.current_history_index]
            self.move_cursor_to(position['line'], position['column'])

    def navigate_forward(self):
        if self.current_history_index < len(self.navigation_history) - 1:
            self.current_history_index += 1
            position = self.navigation_history[self.current_history_index]
            self.move_cursor_to(position['line'], position['column'])

    def move_cursor_to(self, line, column):
        self.editor.web_view.page().runJavaScript(f"moveCursorTo({line}, {column})")

    def get_language_from_extension(self, file_path):
        ext = os.path.splitext(file_path)[1].lower()
        lang_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.html': 'html',
            '.css': 'css',
            '.json': 'json',
            '.xml': 'xml',
            '.sql': 'sql',
            '.md': 'markdown',
            '.java': 'java',
            '.c': 'c',
            '.cpp': 'cpp',
            '.h': 'c',
            '.hpp': 'cpp',
            '.cs': 'csharp',
            '.php': 'php',
            '.rb': 'ruby',
            '.go': 'go',
            '.rs': 'rust',
            '.sh': 'shell',
            '.bat': 'batch',
            '.ps1': 'powershell',
        }
        return lang_map.get(ext, 'plaintext')

    def get_tab_name(self):
        if self.file_path:
            return os.path.basename(self.file_path)
        return datetime.now().strftime("%d-%m-%Y %H:%M")
