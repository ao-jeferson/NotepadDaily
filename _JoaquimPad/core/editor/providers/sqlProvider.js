export function registerSqlProvider(monaco) {
  const KEYWORDS = [
    "SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE",
    "JOIN", "LEFT", "RIGHT", "INNER", "GROUP BY", "ORDER BY",
  ];

  monaco.languages.registerCompletionItemProvider("sql", {
    triggerCharacters: [" ", "."],

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