
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace arkAS.Docflow
{
    public class SearchFormModel : FormModel
    {
        public ViewControlModel Pagination { get; set; }
        public string CreateBtnLabel { get; set; }
    }

    public class StatsFormModel : FormModel
    {
        public object PeriodUnits { get; set; }
        public object DayToDetail { get; set; }
    }
}