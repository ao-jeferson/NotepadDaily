using Avalonia.Controls;
using System;
using System.IO;

namespace joaquimpad.Features.Editor;

public partial class EditorView : UserControl
{
    public EditorView()
    {
        InitializeComponent();
        LoadMonaco();
    }

    private void LoadMonaco()
    {
        var baseDir = AppContext.BaseDirectory;

        var htmlPath = Path.Combine(
            baseDir,
            "Editor",
            "Assets",
            "editor.html"
        );

        EditorWebView.Navigate(new Uri(htmlPath));
    }
}