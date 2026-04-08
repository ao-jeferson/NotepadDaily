using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Service
{
    public class DiffService
    {

        public static List<int> DiffLines(string a, string b)
        {
            var res = new List<int>();
            var la = a.Split('\n');
            var lb = b.Split('\n');

            for (int i = 0; i < Math.Min(la.Length, lb.Length); i++)
                if (la[i] != lb[i])
                    res.Add(i);

            return res;
        }

    }
}
