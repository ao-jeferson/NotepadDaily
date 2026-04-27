import os
import json


class SessionManager:
    def __init__(self, session_file='.session.json'):
        self.session_file = session_file

    def save_session(self, tab_widget, file_explorer):
        """Save current session to file."""
        session_data = {
            'tabs': [],
            'folder': file_explorer.directory_to_load,
            'explorer_visible': file_explorer.isVisible()
        }
        
        for i in range(tab_widget.count()):
            tab = tab_widget.widget(i)
            if hasattr(tab, 'file_path'):
                tab_data = {
                    'file_path': tab.file_path,
                    'is_pinned': getattr(tab, 'is_pinned', False),
                    'index': i,
                    'content': self.get_tab_content(tab)
                }
                session_data['tabs'].append(tab_data)
        
        try:
            with open(self.session_file, 'w', encoding='utf-8') as f:
                json.dump(session_data, f, indent=2)
            return True
        except Exception as e:
            print(f"Error saving session: {e}")
            return False

    def get_tab_content(self, tab):
        """Get content from a tab."""
        if hasattr(tab, 'editor') and hasattr(tab.editor, 'web_view'):
            # Try to get content from editor
            try:
                from PyQt5.QtCore import QEventLoop
                loop = QEventLoop()
                content = [None]
                
                def content_callback(result):
                    content[0] = result
                    loop.quit()
                
                tab.editor.web_view.page().runJavaScript("getContent()", content_callback)
                loop.exec_()
                return content[0] if content[0] is not None else ""
            except:
                return ""
        return ""

    def restore_session(self, tab_widget, file_explorer, open_file_callback, create_untitled_callback=None):
        """Restore session from file."""
        if not os.path.exists(self.session_file):
            return False
        
        try:
            with open(self.session_file, 'r', encoding='utf-8') as f:
                session_data = json.load(f)
            
            # Restore folder and visibility
            if session_data.get('folder'):
                file_explorer.load_directory(session_data['folder'])
                file_explorer.setVisible(session_data.get('explorer_visible', True))
            
            # Restore tabs
            tabs_restored = 0
            for tab_data in session_data.get('tabs', []):
                file_path = tab_data.get('file_path')
                content = tab_data.get('content', '')
                if file_path and os.path.exists(file_path):
                    open_file_callback(file_path, tab_data.get('is_pinned', False), content)
                    tabs_restored += 1
                elif file_path is None and create_untitled_callback:
                    # Restore untitled tab with content
                    create_untitled_callback(tab_data.get('is_pinned', False), content)
                    tabs_restored += 1
            
            print(f"Restored {tabs_restored} tabs from session")
            
            # Reorder tabs to match saved order
            self.reorder_tabs(tab_widget, session_data.get('tabs', []))
            
            return True
        except Exception as e:
            print(f"Error restoring session: {e}")
            return False

    def reorder_tabs(self, tab_widget, saved_tabs):
        """Reorder tabs to match saved order."""
        for i, tab_data in enumerate(saved_tabs):
            if i < tab_widget.count():
                # Find the tab with matching file path
                for j in range(i, tab_widget.count()):
                    tab = tab_widget.widget(j)
                    if hasattr(tab, 'file_path') and tab.file_path == tab_data.get('file_path'):
                        if j != i:
                            # Move tab to correct position
                            tab_text = tab_widget.tabText(j)
                            tab_icon = tab_widget.tabIcon(j)
                            tab_widget.removeTab(j)
                            tab_widget.insertTab(i, tab, tab_text)
                            tab_widget.setTabIcon(i, tab_icon)
                        break
