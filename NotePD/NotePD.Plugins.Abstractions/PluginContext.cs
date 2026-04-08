using System;
using ScintillaNET;

namespace NotePD.Plugin.Abstractions
{
    public class PluginContext
    {
        public Func<Scintilla> GetActiveEditor { get; set; }
        public Action<string> Log { get; set; }
    }
}