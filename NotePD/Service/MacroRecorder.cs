using Domain;
using ScintillaNET;

public static class MacroRecorder
{
    public static bool IsRecording { get; private set; }
    private static Macro currentMacro;

    public static void Start(string name)
    {
        currentMacro = new Macro { Name = name };
        IsRecording = true;
    }

    public static Macro Stop()
    {
        IsRecording = false;
        return currentMacro;
    }

    public static void RecordInsert(string text)
    {
        if (!IsRecording) return;

        currentMacro.Actions.Add(
            new MacroAction { Type = "insert", Data = text });
    }

    public static void Replay(Scintilla editor, Macro macro)
    {
        foreach (var action in macro.Actions)
        {
            if (action.Type == "insert")
                editor.InsertText(editor.CurrentPosition, action.Data);
        }
    }
}
