import importlib
import os

class PluginLoader:

    def __init__(self, plugin_dir):
        self.plugin_dir = plugin_dir
        self.plugins = []

    def load_plugins(self):
        for folder in os.listdir(self.plugin_dir):
            module_path = f"{self.plugin_dir}.{folder}.plugin"
            try:
                module = importlib.import_module(module_path)
                plugin = module.Plugin()
                self.plugins.append(plugin)
            except Exception as e:
                print("Erro carregando plugin:", e)
