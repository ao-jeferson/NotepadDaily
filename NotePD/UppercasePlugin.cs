using NotePD.Plugins.Abstractions;
using ScintillaNET;

namespace SamplePlugin
{
    public class UppercasePlugin : IEditorPlugin
    {
        public string Name => "Uppercase Plugin";
        public string Description => "Converte texto selecionado para maiúsculas";

        public void Initialize(PluginContext context)
        {
            Scintilla editor = context.GetActiveEditor();
            if (editor == null)
                return;

            string selected = editor.SelectedText;
            if (!string.IsNullOrEmpty(selected))
            {
                editor.ReplaceSelection(selected.ToUpper());
            }
        }
    }
}