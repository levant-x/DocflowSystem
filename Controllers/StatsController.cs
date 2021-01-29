using arkAS.Docflow;
using Microsoft.Ajax.Utilities;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using arkAS.Models.Docflow;
using System.Web.Mvc;
using arkAS.Models.Docflow.ServiceProviders.ViewModels;

namespace arcAS.Controllers
{
    public class StatsController : arkAS.Models.Docflow.ControllerBase
    {
        public ActionResult Index(string periodUnitName = "", string startDate = "", string dayToDetail = "")
        {
            var dtStartDate = ParseDateTime(startDate);
            var dtDayToDetail = ParseDateTime(dayToDetail);
            var mng = new StatsManager();
            var model = mng.GetCalendarSelectorForm(periodUnitName, dtStartDate, dtDayToDetail);
            return View(model);
        }

        public string ShowPeriod(string periodUnitName, string startDate)
        {
            return TryExec(() =>
            {
                var dtStartDate = ParseDateTime(startDate);
                var mng = new StatsManager();
                int totalDocsCntPerPeriod = mng.GetDocsTotalCountPerPeriod(periodUnitName, dtStartDate);
                var docsDailyCountGrpByType = mng.GetDocsDailyCountGroupedByType(periodUnitName, dtStartDate);
                var totalDocsCntPerPeriod_NumAndWord =
                    DataHelper.NounDeclensor.HowManyOf("документ", totalDocsCntPerPeriod);
                var res = new DocflowStatsRequestResult()
                {
                    totalDailyDocflCountLabel = totalDocsCntPerPeriod_NumAndWord, 
                    dailyDocCountsGroupedByType = docsDailyCountGrpByType.ToArray()
                };
                return res;
            });
        }

        public string ShowDayDetails(string date)
        {
            return TryExec(() =>
            {
                var dtDate = ParseDateTime(date);
                var mng = new StatsManager();
                var dailyDocflowOfEachDocType = mng.GetDocflowOfDay(dtDate);
                var res = new DocflowStatsRequestResult()
                { dailyDocflowOfEachDocType = dailyDocflowOfEachDocType };
                return res;
            });
        }

        private DateTime ParseDateTime(string date)
        {
            if (!DateTime.TryParse(date, out DateTime res)) res = DateTime.Now;
            return res;
        }
    }
}