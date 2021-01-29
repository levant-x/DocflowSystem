
using arkAS.Models.Docflow.ServiceProviders.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace arkAS.Models.Docflow.ServiceProviders
{
    public class ItemsRequestResult : RequestResultBase
    {
        public int total { get; set; } = 0;
        public object[] items { get; set; }
        public object foreignKeys { get; set; }
    }
}