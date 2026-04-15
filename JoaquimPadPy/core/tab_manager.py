from PySide6.QtWidgets import QTabWidget, QMenu, QTabBar
from PySide6.QtCore import Qt, QPoint

from core.editor_widget import EditorWidget


class TabManager(QTabWidget):
    def __init__(self):
        super().__init__()

        self.setTabsClosable(True)
        self.setMovable(True)

        self._handling_move = False  # evita loop de tabMoved

        self.tabCloseRequested.connect(self._on_tab_close)
        self.tabBar().tabMoved.connect(self._on_tab_moved)

        # Menu de contexto nas abas
        self.tabBar().setContextMenuPolicy(Qt.CustomContextMenu)
        self.tabBar().customContextMenuRequested.connect(
            self._open_context_menu
        )

    # ============================
    # Criar nova aba
    # ============================
    def new_tab(self, title="Novo Documento", pinned=False):
        editor = EditorWidget()
        editor.is_pinned = pinned

        index = self._pinned_count() if pinned else self.count()
        self.insertTab(index, editor, title)
        self.setCurrentIndex(index)

        self._update_tab_ui()
        return editor

    # ============================
    # Atualizar aparência das abas
    # ============================
    def _update_tab_ui(self):
        for i in range(self.count()):
            editor = self.widget(i)
            if not editor:
                continue

            base_title = self.tabText(i).replace("📌 ", "")

            if editor.is_pinned:
                self.tabBar().setTabButton(
                    i,
                    QTabBar.ButtonPosition.RightSide,
                    None
                )
                self.tabBar().setTabToolTip(i, "Aba fixada")
                self.setTabText(i, "📌 " + base_title)
            else:
                self.tabBar().setTabToolTip(i, "")
                self.setTabText(i, base_title)

    # ============================
    # Pin / Unpin
    # ============================
    def toggle_pin(self, index: int):
        editor = self.widget(index)
        if not editor:
            return

        editor.is_pinned = not editor.is_pinned
        title = self.tabText(index).replace("📌 ", "")

        self.removeTab(index)

        new_index = self._pinned_count() if editor.is_pinned else self.count()
        self.insertTab(new_index, editor, title)
        self.setCurrentIndex(new_index)

        self._update_tab_ui()

    # ============================
    # Fechamento controlado
    # ============================
    def _on_tab_close(self, index):
        editor = self.widget(index)
        if editor and editor.is_pinned:
            return  # não fecha aba fixada
        self.removeTab(index)

    # ============================
    # Reordenação com drag & drop
    # ============================
    def _on_tab_moved(self, from_index, to_index):
        if self._handling_move:
            return

        editor = self.widget(to_index)
        if not editor:
            return

        pinned_count = self._pinned_count()

        self._handling_move = True
        try:
            # Aba pinada não pode ir depois das não-pinadas
            if editor.is_pinned and to_index >= pinned_count:
                self.tabBar().moveTab(to_index, pinned_count - 1)

            # Aba normal não pode ir antes das pinadas
            elif not editor.is_pinned and to_index < pinned_count:
                self.tabBar().moveTab(to_index, pinned_count)
        finally:
            self._handling_move = False

    # ============================
    # Fechar outras abas
    # ============================
    def _close_other_tabs(self, keep_index: int):
        for i in reversed(range(self.count())):
            editor = self.widget(i)
            if editor and i != keep_index and not editor.is_pinned:
                self.removeTab(i)

    # ============================
    # Menu de contexto
    # ============================
    def _open_context_menu(self, pos: QPoint):
        index = self.tabBar().tabAt(pos)
        if index < 0:
            return

        editor = self.widget(index)
        if not editor:
            return

        menu = QMenu(self)

        pin_text = "Desafixar aba" if editor.is_pinned else "Fixar aba"
        menu.addAction(pin_text, lambda: self.toggle_pin(index))

        if not editor.is_pinned:
            menu.addSeparator()
            menu.addAction("Fechar", lambda: self.removeTab(index))
            menu.addAction(
                "Fechar outras abas",
                lambda: self._close_other_tabs(index)
            )

        menu.exec(self.tabBar().mapToGlobal(pos))

    # ============================
    # Utilitários
    # ============================
    def _pinned_count(self):
        return sum(
            1 for i in range(self.count())
            if self.widget(i) and self.widget(i).is_pinned
        )

    def current_editor(self):
        return self.currentWidget()

    def find_tab_by_title(self, title: str):
        for i in range(self.count()):
            if self.tabText(i) == title:
                return i
        return None