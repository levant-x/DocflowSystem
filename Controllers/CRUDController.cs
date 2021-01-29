
using arkAS.Models.Docflow.ServiceProviders;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Services;

namespace arcAS.Controllers
{
    public class CRUDController : SearchController
    {
        string selectedEntityName;

        public CRUDController() 
        {
            selectedEntityName = GetType().Name.Replace("Controller", null);
            selectedEntityName = $"as_{selectedEntityName}";
        }

        [WebMethod()]
        public virtual string getItems(int page, int pageSize, string sort, string direction,
            Dictionary<string, string> filter)
        {
            return TryExec(() =>
            {
                var res = mng.GetItems(page, pageSize, sort, direction, filter, selectedEntityName);
                return res;
            });
        }

        [WebMethod()]
        public string get(string id)
        {
            return TryExec(() =>
            {
                var res = mng.GetItem(id, selectedEntityName);
                return res;
            });
        }

        public string getComments(string itemID)
        {
            return TryExec(() =>
            {
                var res = mng.GetItem(itemID, selectedEntityName);
                if (res.d == null) res.msg = "Нет данных либо недоступны для этого типа";
                else res.items = new object[] { res.d };
                return res;
            });
        }

        [WebMethod()]
        public string save(Dictionary<string, object> item)
        {      
            var res = TryExec(() => TryEdit(item));
            return res;
        }

        public string load()
        {
            return "";
        }

        public string docInline(int pk, string name, string value)
        {
            return "";
        }

        [WebMethod()]
        public string remove(int id)
        {
            return TryExec(() =>
            {
                var res = mng.Remove(id, selectedEntityName);
                return res;
            });
        }

        private RequestResultBase TryEdit(Dictionary<string, object> filter)
        {
            var res = mng.CreateOrModifyItem(filter, selectedEntityName);
            return res;
        }
    }
}