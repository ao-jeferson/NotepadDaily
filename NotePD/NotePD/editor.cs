using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ScintillaNET;


namespace NotePD
{
    public class editor
    {

        var editor = new Scintilla { Dock = DockStyle.Fill };

                editor.StyleResetDefault();
        editor.Styles[Style.Default].Font = "Consolas";
        editor.Styles[Style.Default].Size = 12;
        editor.StyleClearAll();

        editor.Lexer = Lexer.Cpp;

        editor.Margins[0].Type = MarginType.Number;
        editor.Margins[0].Width = 40;

    }
}
