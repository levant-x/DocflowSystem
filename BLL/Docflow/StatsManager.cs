
using arkAS.DAL;
using arkAS.Models;
using arkAS.Models.Docflow;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace arkAS.Docflow
{
    public class StatsManager : ManagerBase
    {
        new protected DocflowRepositoryBase db;

        protected Dictionary<object, int> periodUnitDurations = new Dictionary<object, int>()
        {
            { "week", 7 }, { "month", 30 }, { "quarter", 90 }
        };
    


        public StatsManager() : base(new PseudoDataRepository())
        {
            db = base.db as PseudoDataRepository;
        }



        public FormModel GetCalendarSelectorForm(string periodUnitName, DateTime startDate, DateTime dayToDetail)
        {
            var entitiesToWorkWith = new Dictionary<object, string>()
            {
                { "contragents", "Контрагенты" },
                { "shippers", "Системы отправки" },
                { "contractDocs", "Контракты" },
                { "shipments", "Отправления" }
            };
            var periodUnitsToSelectFrom = new Dictionary<object, string>()
            {
                { "week", "За неделю" },
                { "month", "За месяц" },
                { "quarter", "За квартал" }
            };
            var formFilters = new ViewControlModel[]
            {
                new ViewControlModel(typeof(string))
                {
                    Name = "period-unit",
                    Label = "Укажите период" ,
                    DomainRange = periodUnitsToSelectFrom
                },
                new ViewControlModel(typeof(DateTime))
                {
                    Name = "period-start",
                    Label = "Начиная с",
                    SelectedValue = startDate
                }                
            };
            var res = new StatsFormModel()
            {
                NavbarItems = new ViewControlModel(typeof(string))
                {
                    DomainRange = entitiesToWorkWith
                },
                FormFilters = formFilters,
                PeriodUnits = JsonConvert.SerializeObject(periodUnitDurations),
                DayToDetail = dayToDetail.ToString("yyyy-MM-dd")
            };
            return res;
        } 

        public int GetDocsTotalCountPerPeriod(string periodUnitName, DateTime start)
        {
            var daysNum = GetPeriodDuration(periodUnitName);
            var allDocs = GetDocflowPerPeriod(start, daysNum);
            return allDocs.Count;
        }

        public Dictionary<DateTime, object> GetDocsDailyCountGroupedByType(string periodUnitName, DateTime start)
        {            
            int daysNum = GetPeriodDuration(periodUnitName);
            var allDocs = GetDocflowPerPeriod(start, daysNum);
            var docflowGroupedByDay = allDocs.ToArray().GroupBy(doc => GetDayValueOfDoc(doc));
            var res = new Dictionary<DateTime, object>(daysNum);
            
            for (int i = 0; i < daysNum; i++)
            {
                var date = start.AddDays(i);
                // Will show up in popover
                var docsDailyCountGroupedByType = docflowGroupedByDay
                    .Where(grouping => grouping.Key.Day == date.Day && grouping.Key.Month == date.Month)
                    .SelectMany(doc => doc)
                    .GroupBy(doc => GetNameOfDoc(doc))
                    .Select(group => new
                    {
                        TotalAndName = DataHelper.NounDeclensor.HowManyOf(group.Key, group.Count()),
                        Count = group.Count()
                    });

                // Will be the calendar day face
                var docsTotalCountPerDay = docsDailyCountGroupedByType?.Sum(detail => detail.Count);
                var dayDocflow = new
                {
                    date.Day,
                    Date = date.ToString("dd-MM-yyyy"),
                    DocsNum = docsTotalCountPerDay == 0 ? null : docsTotalCountPerDay,
                    Details = docsTotalCountPerDay == 0 ? null : docsDailyCountGroupedByType
                };
                res.Add(date, dayDocflow);
            }
            return res;
        }

        public Tuple<string, object>[] GetDocflowOfDay(DateTime day)
        {
            var allDocs = GetDocflowPerPeriod(day).ToArray();
            var res = allDocs
                .GroupBy(doc => GetNameOfDoc(doc))
                .Select(grouping => new Tuple<string, object>(grouping.Key, grouping
                .Select(doc =>
                {
                    if (doc is as_shipments shipment)
                    {
                        return new
                        {
                            Code = shipment.trackNum,
                            Prop1 = shipment.fromPerson,
                            Prop2 = shipment.toAddr
                        } as object;
                    }
                    else
                    {
                        var contractDoc = doc as as_contractDocs;
                        return new
                        {
                            Code = contractDoc.code,
                            Prop1 = contractDoc.as_docType.name,
                            Prop2 = contractDoc.as_docBasic.as_contragent.name
                        } as object;
                    }
                })
                .OrderBy(doc => doc.GetType().GetProperty("Prop1").GetValue(doc))
                .ToArray()));
            return res.ToArray();
        }

        #region Data query and transform helpers
        private ArrayList GetDocflowPerPeriod(DateTime start, int daysNum = 1)
        {
            DateTime end = start.AddDays(daysNum);
            var res = new ArrayList();
            res.AddRange(db.GetContractDocs()
                .Where(doc => doc.as_docBasic.date >= start && doc.as_docBasic.date < end)
                .ToArray());
            res.AddRange(db.GetShipments()
                .Where(shpm => shpm.date >= start && shpm.date < end)
                .ToArray());
            return res;
        }

        private string GetNameOfDoc(object item)
        {
            var res = "Unknown";
            if (item is as_shipments shipment)
            {
                res = "Отправление";
            }
            else if (item is as_contractDocs contractDoc)
            {
                res = "Контрактный документ"; // contractDoc.as_docType.name;
            }
            return res;
        }

        private DateTime GetDayValueOfDoc(object doc)
        {
            var res = new DateTime();
            if (doc is as_shipments shipment) res = shipment.date;
            else if (doc is as_contractDocs contractDoc) res = contractDoc.as_docBasic.date;
            return res;
        } 

        private int GetPeriodDuration(string periodUnitName)
        {
            periodUnitDurations.TryGetValue(periodUnitName, out int res);
            return res != 0 ? res : periodUnitDurations.First().Value;
        }
        #endregion


        #region System 
        public override void Dispose(bool isDisposing)
        {
            if (isDisposed)
            {
                return;
            }
            if (isDisposing)
            {
                db?.Dispose();
            }
            db = null;
            isDisposed = true;
        }
        #endregion
    }
}