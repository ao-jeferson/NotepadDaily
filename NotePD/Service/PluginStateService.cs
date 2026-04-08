using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Windows.Forms;
using Newtonsoft.Json;
using NotePD.Models;

namespace NotePD.Services
{
    public static class PluginStateService
    {
        private static string PluginStateFile
        {
            get
            {
                return Path.Combine(Application.StartupPath, "plugins", "plugins.json");
            }
        }

        public static List<PluginState> Load()
        {
            if (!File.Exists(PluginStateFile))
                return new List<PluginState>();

            string json = File.ReadAllText(PluginStateFile);
            return JsonConvert.DeserializeObject<List<PluginState>>(json);
        }

        public static void Save(IEnumerable<PluginState> states)
        {
            string dir = Path.GetDirectoryName(PluginStateFile);
            if (!Directory.Exists(dir))
                Directory.CreateDirectory(dir);

            string json = JsonConvert.SerializeObject(states, Formatting.Indented);
            File.WriteAllText(PluginStateFile, json);
        }

        public static bool IsEnabled(string pluginName)
        {
            var states = Load();
            var state = states.FirstOrDefault(p => p.Name == pluginName);
            return state == null ? true : state.Enabled; // default ativo
        }
    }
}