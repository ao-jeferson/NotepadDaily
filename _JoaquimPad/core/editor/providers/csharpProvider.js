export function registerCSharpProvider(monaco) {
  const KEYWORDS = [
    "using", "namespace", "class", "interface", "struct",
    "public", "private", "protected", "internal",
    "static", "readonly", "const",
    "void", "int", "string", "bool", "var", "object",
    "if", "else", "switch", "case",
    "for", "foreach", "while", "do",
    "break", "continue", "return",
    "try", "catch", "finally", "throw",
    "new", "this", "base"
  ];

  monaco.languages.registerCompletionItemProvider("csharp", {
    triggerCharacters: [" ", ".", "<"],

    provideCompletionItems() {
      return {
        suggestions: KEYWORDS.map((kw) => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
        })),
      };
    },
  });
}