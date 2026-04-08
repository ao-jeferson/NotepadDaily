using ScintillaNET;
using System.Drawing;
using System.IO;

namespace NotePD.Services
{
    public static class SyntaxHighlightService
    {
        public static void ApplyCSharp(Scintilla editor)
        {
            editor.Lexer = Lexer.Cpp;

            editor.StyleResetDefault();
            editor.Styles[Style.Default].Font = "Consolas";
            editor.Styles[Style.Default].Size = 12;
            editor.StyleClearAll();

            // Palavras-chave C#
            editor.SetKeywords(0,
                "abstract as base bool break byte case catch char checked " +
                "class const continue decimal default delegate do double else " +
                "enum event explicit extern false finally fixed float for foreach " +
                "goto if implicit in int interface internal is lock long namespace " +
                "new null object operator out override params private protected " +
                "public readonly ref return sbyte sealed short sizeof stackalloc " +
                "static string struct switch this throw true try typeof uint ulong " +
                "unchecked unsafe ushort using virtual void volatile while");

            // Estilos
            editor.Styles[Style.Cpp.Comment].ForeColor = Color.Green;
            editor.Styles[Style.Cpp.CommentLine].ForeColor = Color.Green;
            editor.Styles[Style.Cpp.CommentDoc].ForeColor = Color.DarkGreen;

            editor.Styles[Style.Cpp.Number].ForeColor = Color.DarkOrange;
            editor.Styles[Style.Cpp.String].ForeColor = Color.Brown;
            editor.Styles[Style.Cpp.Character].ForeColor = Color.Brown;

            editor.Styles[Style.Cpp.Preprocessor].ForeColor = Color.Blue;
            editor.Styles[Style.Cpp.Operator].ForeColor = Color.Purple;
            editor.Styles[Style.Cpp.Word].ForeColor = Color.Blue;
            editor.Styles[Style.Cpp.Word2].ForeColor = Color.DarkCyan;
        }

        public static void ApplyJavaScript(Scintilla editor)
        {
            editor.Lexer = Lexer.Cpp;

            // Define JavaScript keywords
            string keywords = "abstract boolean break byte case catch char class const continue " +
                              "debugger default delete do double else enum export extends false " +
                              "finally float for function goto if implements import in instanceof " +
                              "int interface let long native new null package private protected " +
                              "public return short static super switch synchronized this throw " +
                              "throws transient true try typeof var void volatile while with yield";
            editor.SetKeywords(0, keywords);

            // Configure visual styles
            editor.Styles[Style.Cpp.Default].ForeColor = Color.Black;
            editor.Styles[Style.Cpp.Comment].ForeColor = Color.Green;
            editor.Styles[Style.Cpp.Word].ForeColor = Color.Blue; // Keywords
            editor.Styles[Style.Cpp.String].ForeColor = Color.Red;
        }

        public static void ApplySql(Scintilla editor)
        {
            editor.Lexer = Lexer.Sql;

            editor.StyleResetDefault();
            editor.Styles[Style.Default].Font = "Consolas";
            editor.Styles[Style.Default].Size = 12;
            editor.StyleClearAll();

            editor.SetKeywords(0,
                "select from where insert update delete into values create table " +
                "primary key foreign join inner left right on group by order having " +
                "distinct null like and or not limit");

            editor.Styles[Style.Sql.Word].ForeColor = Color.Blue;
            editor.Styles[Style.Sql.String].ForeColor = Color.Brown;
            editor.Styles[Style.Sql.Number].ForeColor = Color.DarkOrange;
            editor.Styles[Style.Sql.Comment].ForeColor = Color.Green;
        }

        public static void ApplyPlainText(Scintilla editor)
        {
            editor.Lexer = Lexer.Null;
            editor.StyleResetDefault();
            editor.StyleClearAll();
        }

        public static void ApplyByFileExtension(Scintilla editor, string filePath)
        {
            string ext = Path.GetExtension(filePath).ToLowerInvariant();

            switch (ext)
            {
                case ".cs":
                    ApplyCSharp(editor);
                    break;

                case ".js":
                    ApplyJavaScript(editor);
                    break;

                case ".sql":
                    ApplySql(editor);
                    break;

                default:
                    ApplyPlainText(editor);
                    break;
            }
        }

    }
}