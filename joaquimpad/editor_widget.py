import os
import json
from PyQt5.QtWidgets import QWidget, QVBoxLayout
from PyQt5.QtCore import QUrl, pyqtSignal, QObject, pyqtSlot
from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEnginePage
from PyQt5.QtWebChannel import QWebChannel


class WebChannelBridge(QObject):
    cursorPositionChanged = pyqtSignal('QVariantMap')
    fileSizeChanged = pyqtSignal('QVariantMap')

    @pyqtSlot('QVariantMap')
    def sendCursorPosition(self, data):
        self.cursorPositionChanged.emit(data)

    @pyqtSlot('QVariantMap')
    def sendFileSize(self, data):
        self.fileSizeChanged.emit(data)


class MonacoEditorWidget(QWidget):
    cursor_moved = pyqtSignal(int, int)  # line, column
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.layout = QVBoxLayout(self)
        self.layout.setContentsMargins(0, 0, 0, 0)
        
        self.web_view = QWebEngineView()
        self.web_page = QWebEnginePage()
        self.web_view.setPage(self.web_page)
        
        self.bridge = WebChannelBridge()
        self.channel = QWebChannel()
        self.channel.registerObject("pywebchannel", self.bridge)
        self.web_page.setWebChannel(self.channel)
        
        html_path = os.path.join(os.path.dirname(__file__), 'monaco_editor.html')
        self.web_view.setUrl(QUrl.fromLocalFile(html_path))
        
        self.layout.addWidget(self.web_view)
        
        self.current_line = 1
        self.current_column = 1
        self.selected_chars = 0
        self.total_chars = 0
        
        self.bridge.cursorPositionChanged.connect(self.on_cursor_position_changed)
        self.bridge.fileSizeChanged.connect(self.on_file_size_changed)

    def on_cursor_position_changed(self, data):
        self.current_line = data.get('line', 1)
        self.current_column = data.get('column', 1)
        self.selected_chars = data.get('selectedChars', 0)
        
        # Emit signal for parent to track history
        self.cursor_moved.emit(self.current_line, self.current_column)

    def on_file_size_changed(self, data):
        self.total_chars = data.get('totalChars', 0)

    def set_content(self, content, language='python'):
        self.web_view.page().runJavaScript(f"setContent({json.dumps(content)}, '{language}')")

    def get_content(self):
        return self.web_view.page().runJavaScript("getContent()")

    def format_document(self):
        self.web_view.page().runJavaScript("formatDocument()")

    def set_language(self, language):
        self.web_view.page().runJavaScript(f"setLanguage('{language}')")
