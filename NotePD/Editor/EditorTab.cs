using ScintillaNET;
using System.Windows.Forms;
using NotePD.Services;
using System;
using Domain;
using System.Text.RegularExpressions;
using Service;

namespace NotePD.Editor
{
    public class EditorTab : TabPage
    {
        public Scintilla Editor { get; private set; }
        public string FilePath { get; set; }
        public event EventHandler CursorPositionChanged;
        public Language CurrentLanguage { get; set; }

        public EditorTab(string title)
        {
            Text = title;

            Editor = new Scintilla();
            Editor.Dock = DockStyle.Fill;
         
            Editor.UpdateUI += Editor_UpdateUI;
            ConfigureEditor();
            Editor.KeyDown += Editor_KeyDown;


            Editor.TextChanged += (s, e) =>
            {
                if (MacroRecorder.IsRecording)
                    MacroRecorder.RecordInsert(Editor.GetTextRange(
                        Editor.CurrentPosition - 1, 1));
            };

            // DiffService .InitializeDiffIndicators(Editor);
            SetWordWrap(false);
            Controls.Add(Editor);

        }
        public void SetWordWrap(bool enabled)
        {
            if (enabled)
            {
                Editor.WrapMode = WrapMode.Word;
                Editor.WrapVisualFlags = WrapVisualFlags.End;
                Editor.WrapIndentMode = WrapIndentMode.Indent;
            }
            else
            {
                Editor.WrapMode = WrapMode.None;
            }
        }

        private string GetIndent(string line)
        {
            Match m = Regex.Match(line, @"^\s+");
            return m.Success ? m.Value : string.Empty;
        }

        private int GetIndentChange(string line)
        {
            string trimmed = line.Trim();

            if (CurrentLanguage == Language.CSharp ||
                CurrentLanguage == Language.JavaScript)
            {
                if (trimmed.EndsWith("{"))
                    return 1;
                if (trimmed.StartsWith("}"))
                    return -1;
            }

            if (CurrentLanguage == Language.Sql)
            {
                if (trimmed.Equals("BEGIN", StringComparison.OrdinalIgnoreCase))
                    return 1;
                if (trimmed.Equals("END", StringComparison.OrdinalIgnoreCase))
                    return -1;
            }

            return 0;
        }


        private void Editor_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.KeyCode != Keys.Enter)
                return;

            int pos = Editor.CurrentPosition;
            int line = Editor.LineFromPosition(pos);

            if (line <= 0)
                return;

            string prevLineText = Editor.Lines[line - 1].Text;
            string indent = GetIndent(prevLineText);

            int indentChange = GetIndentChange(prevLineText);

            if (indentChange > 0)
                indent += "\t";

            if (indentChange < 0 && indent.Length > 0)
                indent = indent.Substring(0, indent.Length - 1);

            // deixa o Scintilla criar a nova linha
            BeginInvoke(new Action(delegate
            {
                Editor.InsertText(Editor.CurrentPosition, indent);
                Editor.GotoPosition(Editor.CurrentPosition + indent.Length);
            }));
        }


        private void Editor_UpdateUI(object sender, EventArgs e)
        {
            if (CursorPositionChanged != null)
                CursorPositionChanged(this, EventArgs.Empty);
        }

        private void ConfigureEditor()
        {
            Editor.StyleResetDefault();
            Editor.Styles[Style.Default].Font = "Consolas";
            Editor.Styles[Style.Default].Size = 12;
            Editor.StyleClearAll();

            Editor.Margins[0].Type = MarginType.Number;
            Editor.Margins[0].Width = 40;

            //Editor.Text = "// Editor funcionando\n";
        }
    }
}
