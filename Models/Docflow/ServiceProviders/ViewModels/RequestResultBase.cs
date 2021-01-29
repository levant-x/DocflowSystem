using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace arkAS.Models.Docflow.ServiceProviders
{
    public class RequestResultBase
    {
        public string msg { get; set; } = string.Empty;
        public object d { get; set; }
        public bool result { get; set; } = true;        
    }
}