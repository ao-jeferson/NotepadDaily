using Plugin;
using ScintillaNET;

namespace NotePD.Plugin.Abstractions
{
    public interface IEditorPlugin
    {
        string Name { get; }
        string Description { get; }

        void Initialize(PluginContext context);
    }
}