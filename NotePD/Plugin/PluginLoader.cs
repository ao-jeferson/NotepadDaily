using Plugin;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;

public static class PluginLoader
{
    public static ILanguagePlugin[] Load()
    {
        string dir = "plugins";
        if (!Directory.Exists(dir))
            return new ILanguagePlugin[0];

        List<ILanguagePlugin> plugins = new List<ILanguagePlugin>();

        foreach (string dll in Directory.GetFiles(dir, "*.dll"))
        {
            var asm = Assembly.LoadFrom(dll);
            foreach (Type t in asm.GetTypes())
                if (typeof(ILanguagePlugin).IsAssignableFrom(t) && !t.IsInterface)
                    plugins.Add((ILanguagePlugin)Activator.CreateInstance(t));
        }

        return plugins.ToArray();
    }
}