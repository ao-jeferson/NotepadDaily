export function registerPythonProvider(monaco) {
  const KEYWORDS = [
    "def", "class", "import", "from", "as", "return",
    "if", "elif", "else", "for", "while", "break",
    "continue", "pass", "try", "except", "finally",
    "with", "lambda", "yield", "global", "nonlocal",
    "True", "False", "None"
  ];

  const BUILTINS = [
    "print()", "len()", "range()", "str()", "int()", "float()",
    "list()", "dict()", "set()", "tuple()", "open()"
  ];

  monaco.languages.registerCompletionItemProvider("python", {
    triggerCharacters: [" ", ".","("],

    provideCompletionItems() {
      const suggestions = [];

      for (const kw of KEYWORDS) {
        suggestions.push({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
        });
      }

      for (const fn of BUILTINS) {
        suggestions.push({
          label: fn,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: fn,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        });
      }

      return { suggestions };
    },
  });
}