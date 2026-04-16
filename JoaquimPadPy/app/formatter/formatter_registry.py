from .python_black import PythonBlackFormatter
from .prettier import PrettierFormatter


FORMATTERS = {
    "Python": PythonBlackFormatter(),
    "JavaScript": PrettierFormatter("JavaScript"),
    "JSON": PrettierFormatter("JSON"),
    "HTML": PrettierFormatter("HTML"),
}
