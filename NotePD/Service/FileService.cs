using System.IO;
using System.Windows.Forms;
using System;

namespace NotePD.Services
{
    public static class FileService
    {
        public static Tuple<string, string> Open()
        {
            OpenFileDialog dlg = new OpenFileDialog();

            if (dlg.ShowDialog() == DialogResult.OK)
            {
                string text = File.ReadAllText(dlg.FileName);
                return Tuple.Create(dlg.FileName, text);
            }

            return null;
        }

        public static void Save(string path, string content)
        {
            File.WriteAllText(path, content);
        }

        public static string SaveAs(string content)
        {
            SaveFileDialog dlg = new SaveFileDialog();

            if (dlg.ShowDialog() == DialogResult.OK)
            {
                File.WriteAllText(dlg.FileName, content);
                return dlg.FileName;
            }

            return null;
        }
    }
}
