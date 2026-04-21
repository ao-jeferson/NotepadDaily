import pkgutil
import importlib
import inspect

import core.highlighters
from PySide6.QtGui import QSyntaxHighlighter


def discover_highlighters():
    """
    Descobre automaticamente todos os QSyntaxHighlighters
    dentro do pacote core.highlighters
    """
    registry = {}
    package = core.highlighters

    for _, module_name, _ in pkgutil.iter_modules(package.__path__):
        # ignora arquivos internos
        if module_name.startswith("_"):
            continue
        if module_name in ("base", "registry"):
            continue

        module = importlib.import_module(
            f"{package.__name__}.{module_name}"
        )

        for _, obj in inspect.getmembers(module, inspect.isclass):
            if (
                issubclass(obj, QSyntaxHighlighter)
                and obj is not QSyntaxHighlighter
                and hasattr(obj, "language")
            ):
                registry[obj.language] = obj

    return registry