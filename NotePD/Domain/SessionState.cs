using Domain;
using System.Collections.Generic;

namespace NotePD.Models
{
    public class SessionState
    {
        public int ActiveTabIndex { get; set; }
        public List<SessionTabInfo> Tabs { get; set; }

        public SessionState()
        {
            Tabs = new List<SessionTabInfo>();
        }
    }
}