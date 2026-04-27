import os
from PyQt5.QtWidgets import (QMainWindow, QTabWidget, QWidget, 
                             QVBoxLayout, QHBoxLayout, QStatusBar, QPushButton, 
                             QSplitter, QMenuBar, QMenu, QAction, QFileDialog, 
                             QLabel, QToolBar, QTabBar)
from PyQt5.QtCore import Qt, QEvent
from PyQt5.QtGui import QIcon
from editor_tab import EditorTab
from file_explorer import FileExplorer
from theme import get_vscode_theme
from session_manager import SessionManager
from icon_manager import IconManager


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Code Editor - Monaco")
        self.setGeometry(100, 100, 1400, 900)
        
        # Initialize managers
        self.icon_manager = IconManager()
        self.session_manager = SessionManager(os.path.join(os.path.dirname(__file__), '.session.json'))
        
        # Apply VS Code-like theme
        self.setStyleSheet(get_vscode_theme())
        
        self.setup_ui()
        self.setup_icons()
        self.file_explorer.load_directory(self.file_explorer.directory_to_load)
        
        # Restore session if exists
        self.restore_session()
        
        # Create new tab if no session restored
        if self.tab_widget.count() == 0:
            self.create_new_tab()


    def setup_ui(self):
        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        
        # Button bar
        self.button_bar = QToolBar()
        self.button_bar.setMovable(False)
        self.addToolBar(self.button_bar)
        
        # New tab button
        self.new_tab_btn = QPushButton()
        self.new_tab_btn.clicked.connect(self.create_new_tab)
        self.button_bar.addWidget(self.new_tab_btn)
        
        # Navigation buttons
        self.nav_back_btn = QPushButton("◀")
        self.nav_back_btn.clicked.connect(self.navigate_back)
        self.nav_back_btn.setEnabled(False)
        self.button_bar.addWidget(self.nav_back_btn)
        
        self.nav_forward_btn = QPushButton("▶")
        self.nav_forward_btn.clicked.connect(self.navigate_forward)
        self.nav_forward_btn.setEnabled(False)
        self.button_bar.addWidget(self.nav_forward_btn)
        
        # Format button
        self.format_btn = QPushButton("Format")
        self.format_btn.clicked.connect(self.format_current_document)
        self.button_bar.addWidget(self.format_btn)
        
        # Main splitter
        self.splitter = QSplitter(Qt.Horizontal)
        main_layout.addWidget(self.splitter)
        
        # File explorer (moved to left)
        self.file_explorer = FileExplorer(self)
        self.file_explorer.setVisible(False)
        self.splitter.addWidget(self.file_explorer)
        
        # Tab widget
        self.tab_widget = QTabWidget()
        self.tab_widget.setTabsClosable(True)
        self.tab_widget.tabCloseRequested.connect(self.close_tab)
        self.tab_widget.currentChanged.connect(self.on_tab_changed)
        self.tab_widget.setContextMenuPolicy(Qt.CustomContextMenu)
        self.tab_widget.customContextMenuRequested.connect(self.show_tab_context_menu)
        self.tab_widget.setMovable(True)  # Enable drag and drop reordering
        self.splitter.addWidget(self.tab_widget)
        
        # Add middle-click handler to tab bar after it's created
        tab_bar = self.tab_widget.tabBar()
        tab_bar.installEventFilter(self)
        
        self.splitter.setSizes([300, 1000])
        
        # Status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        
        self.status_label = QLabel("Line: 1 | Column: 1 | Selected: 0 chars | Size: 0 chars")
        self.status_bar.addWidget(self.status_label)
        
        # Menu bar
        self.create_menu_bar()
        
        # Timer for status bar updates
        self.start_status_timer()

    def setup_icons(self):
        # Use icon manager
        self.new_tab_btn.setIcon(self.icon_manager.get_new_file_icon())
        self.new_tab_btn.setText(" New Tab")
        self.new_tab_btn.setStyleSheet("padding: 5px 10px;")

    def get_icon_for_file(self, file_path):
        return self.icon_manager.get_icon_for_file(file_path)

    def get_icon_for_directory(self):
        return self.icon_manager.get_icon_for_directory()

    def create_menu_bar(self):
        menubar = self.menuBar()
        
        # File menu
        file_menu = menubar.addMenu("File")
        
        new_file_action = QAction("New File", self)
        new_file_action.setShortcut("Ctrl+N")
        new_file_action.triggered.connect(self.create_new_tab)
        file_menu.addAction(new_file_action)
        
        open_file_action = QAction("Open File", self)
        open_file_action.setShortcut("Ctrl+O")
        open_file_action.triggered.connect(self.open_file_dialog)
        file_menu.addAction(open_file_action)
        
        open_folder_action = QAction("Open Folder", self)
        open_folder_action.setShortcut("Ctrl+K Ctrl+O")
        open_folder_action.triggered.connect(self.open_folder_dialog)
        file_menu.addAction(open_folder_action)
        
        save_file_action = QAction("Save File", self)
        save_file_action.setShortcut("Ctrl+S")
        save_file_action.triggered.connect(self.save_current_file)
        file_menu.addAction(save_file_action)
        
        # View menu
        view_menu = menubar.addMenu("View")
        
        toggle_explorer_action = QAction("Toggle File Explorer", self)
        toggle_explorer_action.setShortcut("Ctrl+E")
        toggle_explorer_action.triggered.connect(self.toggle_file_explorer)
        view_menu.addAction(toggle_explorer_action)
        
        # Settings menu
        settings_menu = menubar.addMenu("Settings")
        
        self.allow_duplicate_files = False
        duplicate_action = QAction("Allow Duplicate File Names", self)
        duplicate_action.setCheckable(True)
        duplicate_action.setChecked(False)
        duplicate_action.triggered.connect(self.toggle_duplicate_files)
        settings_menu.addAction(duplicate_action)

    def toggle_duplicate_files(self, checked):
        self.allow_duplicate_files = checked

    def show_tab_context_menu(self, position):
        tab_bar = self.tab_widget.tabBar()
        tab_index = tab_bar.tabAt(position)
        
        if tab_index < 0:
            return
        
        tab = self.tab_widget.widget(tab_index)
        
        menu = QMenu(self)
        
        if tab.is_pinned:
            unpin_action = QAction("Unpin Tab", self)
            unpin_action.triggered.connect(lambda: self.toggle_pin(tab_index))
            menu.addAction(unpin_action)
        else:
            pin_action = QAction("Pin Tab", self)
            pin_action.triggered.connect(lambda: self.toggle_pin(tab_index))
            menu.addAction(pin_action)
        
        menu.addSeparator()
        
        close_current_action = QAction("Close Current", self)
        close_current_action.triggered.connect(lambda: self.close_tab(tab_index))
        menu.addAction(close_current_action)
        
        close_others_action = QAction("Close Others", self)
        close_others_action.triggered.connect(lambda: self.close_other_tabs(tab_index))
        menu.addAction(close_others_action)
        
        menu.exec_(tab_bar.mapToGlobal(position))

    def close_other_tabs(self, current_index):
        indices_to_close = []
        for i in range(self.tab_widget.count()):
            if i != current_index:
                indices_to_close.append(i)
        
        # Close from right to left to avoid index shifting
        for index in sorted(indices_to_close, reverse=True):
            self.close_tab(index)

    def create_new_tab(self):
        # Check if we should allow multiple untitled tabs
        if not self.allow_duplicate_files:
            # Check if there's already an untitled tab with the same timestamp
            from datetime import datetime
            current_timestamp = datetime.now().strftime("%d-%m-%Y %H:%M")
            
            for i in range(self.tab_widget.count()):
                tab = self.tab_widget.widget(i)
                if isinstance(tab, EditorTab) and not tab.file_path:
                    tab_name = tab.get_tab_name()
                    if tab_name == current_timestamp:
                        self.tab_widget.setCurrentIndex(i)
                        self.status_label.setText("Untitled tab already exists for this minute")
                        return
        
        tab = EditorTab(parent=self)
        tab_name = tab.get_tab_name()
        index = self.tab_widget.addTab(tab, tab_name)
        self.tab_widget.setTabIcon(index, self.get_icon_for_file(tab.file_path))
        self.tab_widget.setCurrentIndex(index)
        
        # Add pin button to tab
        self.add_pin_button(index)

    def add_pin_button(self, index):
        tab = self.tab_widget.widget(index)
        if not isinstance(tab, EditorTab):
            return
            
        tab_bar = self.tab_widget.tabBar()
        
        # Remove existing pin button if any
        existing_btn = tab_bar.tabButton(index, tab_bar.LeftSide)
        if existing_btn:
            existing_btn.deleteLater()
        
        # Only add pin button if tab is pinned
        if tab.is_pinned:
            pin_btn = QPushButton("📌")
            pin_btn.setFixedSize(20, 20)
            pin_btn.setStyleSheet("border: none; background: transparent;")
            pin_btn.clicked.connect(lambda: self.toggle_pin(index))
            tab_bar.setTabButton(index, tab_bar.LeftSide, pin_btn)

    def toggle_pin(self, index):
        if index < 0 or index >= self.tab_widget.count():
            return
        
        tab = self.tab_widget.widget(index)
        tab.is_pinned = not tab.is_pinned
        
        # Update pin button visibility
        self.add_pin_button(index)
        
        if tab.is_pinned:
            # Move to left
            tab_text = self.tab_widget.tabText(index)
            tab_icon = self.tab_widget.tabIcon(index)
            self.tab_widget.removeTab(index)
            self.tab_widget.insertTab(0, tab, tab_text)
            self.tab_widget.setTabIcon(0, tab_icon)
            self.add_pin_button(0)
            self.tab_widget.setCurrentIndex(0)
        else:
            # Move to right of pinned tabs
            pinned_count = sum(1 for i in range(self.tab_widget.count()) 
                             if self.tab_widget.widget(i).is_pinned)
            if index > pinned_count:
                return
            tab_text = self.tab_widget.tabText(index)
            tab_icon = self.tab_widget.tabIcon(index)
            self.tab_widget.removeTab(index)
            self.tab_widget.insertTab(pinned_count, tab, tab_text)
            self.tab_widget.setTabIcon(pinned_count, tab_icon)
            self.add_pin_button(pinned_count)
            self.tab_widget.setCurrentIndex(pinned_count)

    def close_tab(self, index):
        if self.tab_widget.count() > 1:
            self.tab_widget.removeTab(index)
        else:
            # Create a new empty tab if closing the last one
            self.tab_widget.removeTab(index)
            self.create_new_tab()

    def on_tab_changed(self, index):
        self.update_navigation_buttons()

    def toggle_file_explorer(self):
        self.file_explorer.setVisible(not self.file_explorer.isVisible())

    def open_file_dialog(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Open File", "", 
            "All Files (*);;Python Files (*.py);;JavaScript Files (*.js);;HTML Files (*.html);;CSS Files (*.css)"
        )
        if file_path:
            self.open_file(file_path)

    def open_folder_dialog(self):
        folder_path = QFileDialog.getExistingDirectory(self, "Open Folder")
        if folder_path:
            self.file_explorer.load_directory(folder_path)
            self.file_explorer.setVisible(True)

    def open_file(self, file_path):
        # Check if file is already open
        for i in range(self.tab_widget.count()):
            tab = self.tab_widget.widget(i)
            if isinstance(tab, EditorTab) and tab.file_path == file_path:
                if self.allow_duplicate_files:
                    # Create new tab but move cursor to end
                    new_tab = EditorTab(file_path, self)
                    tab_name = new_tab.get_tab_name()
                    index = self.tab_widget.addTab(new_tab, tab_name)
                    self.tab_widget.setTabIcon(index, self.get_icon_for_file(file_path))
                    self.tab_widget.setCurrentIndex(index)
                    self.add_pin_button(index)
                else:
                    # Switch to existing tab and show message
                    self.tab_widget.setCurrentIndex(i)
                    self.status_label.setText(f"File already open: {os.path.basename(file_path)}")
                return
        
        # File not open, create new tab
        tab = EditorTab(file_path, self)
        tab_name = tab.get_tab_name()
        index = self.tab_widget.addTab(tab, tab_name)
        self.tab_widget.setTabIcon(index, self.get_icon_for_file(file_path))
        self.tab_widget.setCurrentIndex(index)
        self.add_pin_button(index)

    def save_current_file(self):
        current_tab = self.tab_widget.currentWidget()
        if current_tab and isinstance(current_tab, EditorTab):
            if current_tab.file_path:
                self.current_saving_tab = current_tab
                current_tab.editor.web_view.page().runJavaScript("getContent()", self.save_content_callback)
            else:
                self.save_file_as(current_tab)

    def save_content_callback(self, content):
        if hasattr(self, 'current_saving_tab') and self.current_saving_tab and self.current_saving_tab.file_path:
            with open(self.current_saving_tab.file_path, 'w', encoding='utf-8') as f:
                f.write(content)

    def save_file_as(self, tab):
        file_path, _ = QFileDialog.getSaveFileName(
            self, "Save File", "", 
            "All Files (*);;Python Files (*.py);;JavaScript Files (*.js);;HTML Files (*.html);;CSS Files (*.css)"
        )
        if file_path:
            tab.file_path = file_path
            self.tab_widget.setTabText(self.tab_widget.indexOf(tab), os.path.basename(file_path))
            self.tab_widget.setTabIcon(self.tab_widget.indexOf(tab), self.get_icon_for_file(file_path))
            self.save_current_file()

    def format_current_document(self):
        current_tab = self.tab_widget.currentWidget()
        if current_tab and isinstance(current_tab, EditorTab):
            current_tab.editor.format_document()

    def navigate_back(self):
        current_tab = self.tab_widget.currentWidget()
        if current_tab and isinstance(current_tab, EditorTab):
            current_tab.navigate_back()
            self.update_navigation_buttons()

    def navigate_forward(self):
        current_tab = self.tab_widget.currentWidget()
        if current_tab and isinstance(current_tab, EditorTab):
            current_tab.navigate_forward()
            self.update_navigation_buttons()

    def update_navigation_buttons(self):
        current_tab = self.tab_widget.currentWidget()
        if current_tab and isinstance(current_tab, EditorTab):
            self.nav_back_btn.setEnabled(current_tab.current_history_index > 0)
            self.nav_forward_btn.setEnabled(
                current_tab.current_history_index < len(current_tab.navigation_history) - 1
            )
        else:
            self.nav_back_btn.setEnabled(False)
            self.nav_forward_btn.setEnabled(False)

    def start_status_timer(self):
        from PyQt5.QtCore import QTimer
        self.status_timer = QTimer()
        self.status_timer.timeout.connect(self.update_status_bar)
        self.status_timer.start(100)

    def update_status_bar(self):
        current_tab = self.tab_widget.currentWidget()
        if current_tab and isinstance(current_tab, EditorTab):
            editor = current_tab.editor
            self.status_label.setText(
                f"Line: {editor.current_line} | Column: {editor.current_column} | "
                f"Selected: {editor.selected_chars} chars | Size: {editor.total_chars} chars"
            )

    def save_session(self):
        self.session_manager.save_session(self.tab_widget, self.file_explorer)

    def restore_session(self):
        def open_file_callback(file_path, is_pinned, content=None):
            tab = EditorTab(file_path, self)
            tab_name = tab.get_tab_name()
            index = self.tab_widget.addTab(tab, tab_name)
            self.tab_widget.setTabIcon(index, self.get_icon_for_file(file_path))
            tab.is_pinned = is_pinned
            self.add_pin_button(index)
            # Set content if provided
            if content is not None:
                from PyQt5.QtCore import QTimer
                QTimer.singleShot(2000, lambda: tab.editor.set_content(content, tab.get_language_from_extension(file_path)))
        
        def create_untitled_callback(is_pinned, content=None):
            tab = EditorTab(parent=self)
            tab_name = tab.get_tab_name()
            index = self.tab_widget.addTab(tab, tab_name)
            self.tab_widget.setTabIcon(index, self.get_icon_for_file(tab.file_path))
            tab.is_pinned = is_pinned
            self.add_pin_button(index)
            # Set content if provided
            if content is not None:
                from PyQt5.QtCore import QTimer
                QTimer.singleShot(2000, lambda: tab.editor.set_content(content, 'python'))
        
        self.session_manager.restore_session(self.tab_widget, self.file_explorer, open_file_callback, create_untitled_callback)

    def closeEvent(self, event):
        # Save session before closing
        self.save_session()
        event.accept()

    def eventFilter(self, obj, event):
        # Handle middle-click on tab bar to close tabs
        if event.type() == QEvent.MouseButtonPress:
            if event.button() == Qt.MiddleButton:
                if obj == self.tab_widget.tabBar():
                    tab_index = self.tab_widget.tabBar().tabAt(event.pos())
                    if tab_index >= 0:
                        self.close_tab(tab_index)
                        return True
        return super().eventFilter(obj, event)
