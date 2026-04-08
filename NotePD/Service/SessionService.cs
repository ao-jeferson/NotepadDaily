using System;
using System.IO;
using System.Text;
using System.Windows.Forms;
using Newtonsoft.Json;
using NotePD.Models;

namespace NotePD.Services
{
    public static class SessionService
    {
        private static string SessionFile
        {
            get
            {
                return Path.Combine(Application.StartupPath, "session.json");
            }
        }

        public static void Save(SessionState session)
        {
            string json = JsonConvert.SerializeObject(
                session,
                Formatting.Indented);


            //if (!Directory.Exists(SessionFile))
            //    Directory.CreateDirectory(SessionFile);


            File.WriteAllText(SessionFile, json, Encoding.UTF8);
        }

        public static SessionState Load()
        {
            if (!File.Exists(SessionFile))
                return null;

            string json = File.ReadAllText(SessionFile, Encoding.UTF8);

            return JsonConvert.DeserializeObject<SessionState>(json);
        }
    }
}