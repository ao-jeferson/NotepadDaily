using System;
using System.IO;

namespace NotePD.Services
{
    public static class AutosaveService
    {
        private static readonly string Dir =
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "autosave");

        public static void Save(string id, string text)
        {
            Directory.CreateDirectory(Dir);
            File.WriteAllText(Path.Combine(Dir, $"{id}.txt"), text);
        }
    }
}