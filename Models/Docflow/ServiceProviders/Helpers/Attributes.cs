using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace arkAS.Docflow
{
    [Serializable]
    public class DataModelLabelAttribute : Attribute
    {
        public string DisplayName { get; set; }
        public bool RemovableByDefault { get; set; }

        public DataModelLabelAttribute()
        {
            RemovableByDefault = true;
        }
    }

    public class IgnoreRecurseValidationAttribute : Attribute
    {

    }
}