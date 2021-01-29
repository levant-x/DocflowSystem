using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace arkAS.Docflow
{
    public class MultyLangTuple
    {
        protected Dictionary<string, string> names { get; } = new Dictionary<string, string>();

        public string Key { get; set; }
        public int Duration { get; set; }

        public MultyLangTuple AddName(string translation, string cultureName)
        {
            if (!names.ContainsKey(cultureName))
            {
                names.Add(cultureName, translation);
            }
            return this;
        }

        public string NameIn(string cultureName)
        {
            return names.ContainsKey(cultureName) ? names[cultureName] :
                string.Empty;
        }
    }
}