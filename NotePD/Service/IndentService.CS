using Domain;
using ScintillaNET;
using System.Text.RegularExpressions;

namespace NotePD.Services
{
    public static class IndentService
    {
        public static void HandleCharAdded(
            Scintilla editor,
            Language language,
            int ch)
        {
            // Apenas ENTER
            if (ch != '\n')
                return;

            int currentLine = editor.LineFromPosition(editor.CurrentPosition);
            if (currentLine <= 0)
                return;

            int prevLine = currentLine - 1;

            string prevText = editor.Lines[prevLine].Text;
            string prevIndent = GetIndentation(prevText);

            int indentChange = GetIndentChange(prevText, language);

            string newIndent = prevIndent;

            if (indentChange > 0)
                newIndent += new string('\t', indentChange);

            if (indentChange < 0 && prevIndent.Length > 0)
                newIndent = prevIndent.Substring(0, prevIndent.Length - 1);

            editor.InsertText(editor.CurrentPosition, newIndent);
            editor.GotoPosition(editor.CurrentPosition + newIndent.Length);
        }

        private static string GetIndentation(string line)
        {
            Match m = Regex.Match(line, @"^\s+");
            return m.Success ? m.Value : string.Empty;
        }

        private static int GetIndentChange(string line, Language language)
        {
            line = line.Trim();

            switch (language)
            {
                case Language.CSharp:
                case Language.JavaScript:
                    // aumenta após {
                    if (line.EndsWith("{"))
                        return 1;

                    // diminui antes de }
                    if (line.StartsWith("}"))
                        return -1;

                    break;

                case Language.Sql:
                    // SQL: BEGIN / END
                    if (line.EndsWith("begin") ||
                        line.EndsWith("BEGIN"))
                        return 1;

                    if (line == "end" || line == "END")
                        return -1;

                    break;
            }

            return 0;
        }
    }
}