using NotePD.Plugins.Abstractions;
using NotePD.Models;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Windows.Forms;
using NotePD.Plugin.Abstractions;

namespace NotePD.Services
{
    public static class PluginLoader
    {
        public static List<IEditorPlugin> LoadPlugins(PluginContext context)
        {
            var plugins = new List<IEditorPlugin>();
            string pluginPath = Path.Combine(Application.StartupPath, "plugins");

            if (!Directory.Exists(pluginPath))
                Directory.CreateDirectory(pluginPath);

            foreach (string dll in Directory.GetFiles(pluginPath, "*.dll"))
            {
                Assembly asm = Assembly.LoadFrom(dll);

                foreach (var type in asm.GetTypes())
                {
                    if (typeof(IEditorPlugin).IsAssignableFrom(type)
                        && !type.IsInterface
                        && !type.IsAbstract)
                    {
                        IEditorPlugin plugin =
                            (IEditorPlugin)System.Activator.CreateInstance(type);

                        // 🔑 RESPEITA ATIVAÇÃO
                        if (PluginStateService.IsEnabled(plugin.Name))
                        {
                            plugin.Initialize(context);
                            plugins.Add(plugin);
                        }
                    }
                }
            }

            return plugins;
        }
    }
}