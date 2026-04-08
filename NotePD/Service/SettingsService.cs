using System.IO;
using System.Windows.Forms;
using Domain;
using Newtonsoft.Json;
using NotePD.Models;

namespace NotePD.Services
{
    public static class SettingsService
    {
        private static string SettingsFile
        {
            get
            {
                return Path.Combine(Application.StartupPath, "settings.json");
            }
        }

        public static UserSettings Load()
        {
            if (!File.Exists(SettingsFile))
            {
                return new UserSettings
                {
                    Theme = "Dark",
                    FontName = "Consolas",
                    FontSize = 12,
                    UseTabs = true
                };
            }

            string json = File.ReadAllText(SettingsFile);

            return JsonConvert.DeserializeObject<UserSettings>(json);
        }

        public static void Save(UserSettings settings)
        {
            string json = JsonConvert.SerializeObject(
                settings,
                Formatting.Indented);

            File.WriteAllText(SettingsFile, json);
        }
    }
}