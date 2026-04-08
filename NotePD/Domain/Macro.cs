using Domain;
using System.Collections.Generic;

public class Macro
{
    public string Name { get; set; }
    public List<MacroAction> Actions { get; set; }

    public Macro()
    {
        Actions = new List<MacroAction>();
    }
}