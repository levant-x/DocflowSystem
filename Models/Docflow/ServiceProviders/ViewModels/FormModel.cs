
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace arkAS.Docflow
{
    public class FormModel
    {
        public ViewControlModel NavbarItems { get; set; }
        public ViewControlModel[] FormFilters { get; set; }
        public SearchQueryModel SearchQuery { get; set; }
        public bool AllowSelects { get; set; } = true;        
    }
}