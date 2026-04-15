from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QPushButton,
    QCheckBox, QListWidget, QListWidgetItem
)
from PySide6.QtGui import QTextCursor, QTextDocument


class FindReplaceDialog(QDialog):
    def __init__(self, editor, parent=None):
        super().__init__(parent)
        self.editor = editor
        
        self.setObjectName("FindReplaceDialog")
        self.setWindowTitle("Buscar e Substituir")
        self.resize(450, 300)
        self.setModal(False)

        self.build_ui()

    # =============================
    # UI
    # =============================
    def build_ui(self):
        layout = QVBoxLayout(self)

        # Buscar
        find_layout = QHBoxLayout()
        find_layout.addWidget(QLabel("Buscar:"))
        self.find_input = QLineEdit()
        find_layout.addWidget(self.find_input)
        layout.addLayout(find_layout)

        # Substituir
        replace_layout = QHBoxLayout()
        replace_layout.addWidget(QLabel("Substituir:"))
        self.replace_input = QLineEdit()
        replace_layout.addWidget(self.replace_input)
        layout.addLayout(replace_layout)

        # Opções
        self.case_checkbox = QCheckBox("Diferenciar maiúsculas/minúsculas")
        layout.addWidget(self.case_checkbox)

        # Botões principais
        buttons = QHBoxLayout()

        btn_find = QPushButton("Buscar próximo")
        btn_find.clicked.connect(self.find_next)
        buttons.addWidget(btn_find)

        btn_replace = QPushButton("Substituir")
        btn_replace.clicked.connect(self.replace_one)
        buttons.addWidget(btn_replace)

        btn_replace_all = QPushButton("Substituir tudo")
        btn_replace_all.clicked.connect(self.replace_all)
        buttons.addWidget(btn_replace_all)

        layout.addLayout(buttons)

        # Buscar em todas as abas
        btn_find_all = QPushButton("Buscar em todas as abas")
        btn_find_all.clicked.connect(self.find_all_tabs)
        layout.addWidget(btn_find_all)

        # Lista de resultados
        self.result_list = QListWidget()
        self.result_list.itemClicked.connect(self.go_to_result)
        layout.addWidget(self.result_list)

    # =============================
    # Lógica de busca (aba atual)
    # =============================
    def _flags(self):
        flags = QTextDocument.FindFlags()
        if self.case_checkbox.isChecked():
            flags |= QTextDocument.FindCaseSensitively
        return flags

    def find_next(self):
        text = self.find_input.text()
        if not text:
            return

        found = self.editor.find(text, self._flags())

        if not found:
            self.editor.moveCursor(QTextCursor.Start)
            self.editor.find(text, self._flags())

    def replace_one(self):
        cursor = self.editor.textCursor()
        if cursor.hasSelection():
            cursor.insertText(self.replace_input.text())
        self.find_next()

    def replace_all(self):
        text = self.find_input.text()
        if not text:
            return

        self.editor.moveCursor(QTextCursor.Start)

        while self.editor.find(text, self._flags()):
            cursor = self.editor.textCursor()
            cursor.insertText(self.replace_input.text())

    # =============================
    # Buscar em todas as abas
    # =============================
    def find_all_tabs(self):
        self.result_list.clear()

        text = self.find_input.text()
        if not text:
            return

        tab_manager = self.parent().tabs

        for tab_index in range(tab_manager.count()):
            editor = tab_manager.widget(tab_index)
            tab_title = tab_manager.tabText(tab_index)

            cursor = editor.textCursor()
            cursor.movePosition(QTextCursor.Start)
            editor.setTextCursor(cursor)

            while editor.find(text, self._flags()):
                cursor = editor.textCursor()
                start = cursor.selectionStart()
                preview = cursor.selectedText()

                item = QListWidgetItem(
                    f"{tab_title} → {preview}"
                )
                item.setData(
                    0x0100,
                    {
                        "tab_index": tab_index,
                        "position": start
                    }
                )

                self.result_list.addItem(item)

    def go_to_result(self, item):
        data = item.data(0x0100)
        tab_index = data["tab_index"]
        position = data["position"]

        tab_manager = self.parent().tabs
        tab_manager.setCurrentIndex(tab_index)

        editor = tab_manager.currentWidget()
        cursor = editor.textCursor()
        cursor.setPosition(position)
        cursor.movePosition(
            QTextCursor.Right,
            QTextCursor.KeepAnchor,
            len(self.find_input.text())
        )

        editor.setTextCursor(cursor)
        editor.setFocus()