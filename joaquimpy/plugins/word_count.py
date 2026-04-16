from plugins.base import PluginBase

class WordCountPlugin(PluginBase):
    name = "Contador de Palavras"

    def load(self, editor):
        text = editor.toPlainText()
        print(f"Palavras: {len(text.split())}")
