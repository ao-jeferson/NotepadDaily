using System;
using System.Text.RegularExpressions;
using System.Windows.Forms;
using ScintillaNET;

public class FindReplaceForm : Form
{
    private TextBox txtFind;
    private TextBox txtReplace;
    private CheckBox chkRegex;
    private Button btnFind;
    private Button btnReplace;

    private Scintilla editor;

    public FindReplaceForm(Scintilla scintilla)
    {
        editor = scintilla;

        Text = "Find / Replace";
        Width = 400;
        Height = 200;

        txtFind = new TextBox { Left = 10, Top = 10, Width = 360 };
        txtReplace = new TextBox { Left = 10, Top = 40, Width = 360 };

        chkRegex = new CheckBox { Left = 10, Top = 70, Text = "Regex" };

        btnFind = new Button { Text = "Find", Left = 10, Top = 100 };
        btnReplace = new Button { Text = "Replace All", Left = 100, Top = 100 };

        btnFind.Click += Find_Click;
        btnReplace.Click += Replace_Click;

        Controls.AddRange(new Control[] {
            txtFind, txtReplace, chkRegex, btnFind, btnReplace });
    }

    private void Find_Click(object sender, EventArgs e)
    {
        editor.SearchFlags = chkRegex.Checked ? SearchFlags.Regex : SearchFlags.None;
        editor.TargetStart = editor.CurrentPosition;
        editor.TargetEnd = editor.TextLength;

        if (editor.SearchInTarget(txtFind.Text) >= 0)
            editor.SetSelection(editor.TargetStart, editor.TargetEnd);
    }

    private void Replace_Click(object sender, EventArgs e)
    {
        string text = editor.Text;
        editor.Text = chkRegex.Checked
            ? Regex.Replace(text, txtFind.Text, txtReplace.Text)
            : text.Replace(txtFind.Text, txtReplace.Text);
    }
}