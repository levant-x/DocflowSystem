
using Microsoft.Ajax.Utilities;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using arkAS.Models.Docflow;
using System.Web.Services;
using System.Web.Script.Serialization;
using arkAS.Docflow;
using System.Web.Mvc;

namespace arcAS.Controllers
{
    public class SearchController : arkAS.Models.Docflow.ControllerBase
    {
        protected JsonSerializer json = new JsonSerializer();
        protected SearchManager mng = new SearchManager();

                
        public ActionResult Form(string entityName = "", string query = "")
        {
            var model = mng.GetDocflowCRUDForm(entityName, query);            
            return View(model);
        }
    }
}