from PyQt6.Qsci import (
    QsciLexerPython,
    QsciLexerCPP,
    QsciLexerJSON,
    QsciLexerJavaScript,
    QsciLexerHTML,
    QsciLexerXML,
    QsciLexerBash,
    QsciLexerSQL,
    QsciLexerMarkdown,
)

LANGUAGES = {
    "Plain Text": {
        "lexer": None,
        "extensions": []
    },
    "Python": {
        "lexer": QsciLexerPython,
        "extensions": [".py"]
    },
    "C / C++": {
        "lexer": QsciLexerCPP,
        "extensions": [".c", ".cpp", ".h"]
    },
    "JavaScript": {
        "lexer": QsciLexerJavaScript,
        "extensions": [".js"]
    },
    "JSON": {
        "lexer": QsciLexerJSON,
        "extensions": [".json"]
    },
    "HTML": {
        "lexer": QsciLexerHTML,
        "extensions": [".html", ".htm"]
    },
    "XML": {
        "lexer": QsciLexerXML,
        "extensions": [".xml"]
    },
    "Shell Script": {
        "lexer": QsciLexerBash,
        "extensions": [".sh"]
    },
    "SQL": {
        "lexer": QsciLexerSQL,
        "extensions": [".sql"]
    },
    "Markdown": {
        "lexer": QsciLexerMarkdown,
        "extensions": [".md"]
    },
}