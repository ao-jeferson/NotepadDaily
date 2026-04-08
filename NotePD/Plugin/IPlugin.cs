using NotePD.Editor;
using ScintillaNET;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Plugin
{
    public interface IPlugin
    {

        string Name { get; }
        string[] Extensions { get; }

        void Apply(Scintilla editor);


    }
}
