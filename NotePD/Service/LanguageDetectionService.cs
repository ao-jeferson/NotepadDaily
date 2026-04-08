using Domain;
using System.IO;

namespace NotePD.Services
{
    public static class LanguageDetectionService
    {
        public static Language DetectFromFile(string filePath)
        {
            if (string.IsNullOrEmpty(filePath))
                return Language.Text;

            string ext = Path.GetExtension(filePath).ToLowerInvariant();

            switch (ext)
            {
                case ".cs":
                    return Language.CSharp;

                case ".js":
                    return Language.JavaScript;

                case ".sql":
                    return Language.Sql;

                default:
                    return Language.Text;
            }
        }
    }
}