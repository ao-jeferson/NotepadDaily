using NotePD.Plugin.Abstractions;
using ScintillaNET;

namespace NotePD.Plugins.Abstractions
{
    public interface IEditorPlugin
    {
        string Name { get; }
        string Description { get; }

        void Initialize(PluginContext context);
    }
}