using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace arkAS.Models.Docflow.ServiceProviders.ViewModels
{
    public class DocflowStatsRequestResult : RequestResultBase
    {
        public string totalDailyDocflCountLabel { get; set; }
        public KeyValuePair<DateTime, object>[] dailyDocCountsGroupedByType { get; set; }
        public Tuple<string, object>[] dailyDocflowOfEachDocType { get; set; }
    }
}