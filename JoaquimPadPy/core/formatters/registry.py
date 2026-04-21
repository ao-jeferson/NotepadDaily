import pkgutil
import importlib
import inspect

import core.formatters


def discover_formatters():
    """
    Descobre automaticamente todos os formatters
    dentro do pacote core.formatters
    """
    registry = {}

    package = core.formatters

    for _, module_name, _ in pkgutil.iter_modules(package.__path__):
        # ignora módulos internos
        if module_name.startswith("_"):
            continue
        if module_name in ("base_formatter", "registry"):
            continue

        module = importlib.import_module(
            f"{package.__name__}.{module_name}"
        )

        for _, obj in inspect.getmembers(module, inspect.isclass):
            # contrato mínimo do formatter
            if (
                hasattr(obj, "language")
                and callable(getattr(obj, "format", None))
                and callable(getattr(obj, "create_highlighter", None))
            ):
                registry[obj.language] = obj()

    return registry