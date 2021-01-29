using arkAS.Models.Docflow.ServiceProviders;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace arkAS.Models.Docflow
{
    public abstract class ControllerBase : Controller
    {
        protected IAccessManager accessManager;


        public ControllerBase()
        {
            accessManager = new AccessManager();
        }


        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);
            if (!accessManager.HasPermission(HttpContext))
            {
                //filterContext.Result = new RedirectResult("/Account/Login");
            }
        }

        protected string TryExec(Func<RequestResultBase> getQueryResult)
        {
            try
            {
                return JsonConvert.SerializeObject(getQueryResult());
            }
            catch (SqlException)
            {
                return JsonConvert.SerializeObject(new RequestResultBase()
                {
                    result = false,
                    msg = "Возникли проблемы при обращении к хранилищу. " +
                    "Вероятно, превышено время ожидания. Повторите попытку позднее"
                });
            }
            catch (Exception)
            {
                return JsonConvert.SerializeObject(new RequestResultBase()
                {
                    result = false,
                    msg = "Результаты будут доступны после окончания технических работ"
                });
            }
        }

        protected override void Dispose(bool disposing)
        {

        }
    }
}