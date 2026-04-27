import os
from PyQt5.QtGui import QIcon


class IconManager:
    def __init__(self, icons_dir='icons'):
        self.icons_dir = icons_dir
        self.language_icons = {}
        self.default_icon = None
        self.folder_icon = None
        self.new_file_icon = None
        self.code_file_icon = None
        self.load_icons()

    def load_icons(self):
        """Load all icons from the icons directory."""
        icon_path = os.path.join(os.path.dirname(__file__), self.icons_dir)
        
        # Load main icons
        self.new_file_icon = QIcon(os.path.join(icon_path, 'new_file.svg'))
        self.code_file_icon = QIcon(os.path.join(icon_path, 'code_file.svg'))
        
        # Load language icons
        icon_map = {
            'python': 'python.svg',
            'javascript': 'javascript.svg',
            'typescript': 'javascript.svg',
            'html': 'html.svg',
            'css': 'css.svg',
            'json': 'json.svg',
            'xml': 'xml.svg',
            'sql': 'sql.svg',
            'markdown': 'markdown.svg',
            'java': 'java.svg',
            'c': 'c.svg',
            'cpp': 'cpp.svg',
            'csharp': 'csharp.svg',
            'php': 'php.svg',
            'ruby': 'ruby.svg',
            'go': 'go.svg',
            'rust': 'rust.svg',
            'shell': 'shell.svg',
            'batch': 'batch.svg',
            'powershell': 'powershell.svg',
        }
        
        for lang, icon_file in icon_map.items():
            self.language_icons[lang] = QIcon(os.path.join(icon_path, icon_file))
        
        self.default_icon = QIcon(os.path.join(icon_path, 'default.svg'))
        self.folder_icon = QIcon(os.path.join(icon_path, 'folder.svg'))

    def get_icon_for_file(self, file_path):
        """Get the appropriate icon for a file based on its extension."""
        if not file_path:
            return self.default_icon
        
        ext = os.path.splitext(file_path)[1].lower()
        icon_map = {
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
        
        lang = icon_map.get(ext)
        if lang and lang in self.language_icons:
            return self.language_icons[lang]
        return self.default_icon

    def get_icon_for_directory(self):
        """Get the folder icon."""
        return self.folder_icon

    def get_new_file_icon(self):
        """Get the new file icon."""
        return self.new_file_icon

    def get_code_file_icon(self):
        """Get the code file icon."""
        return self.code_file_icon
