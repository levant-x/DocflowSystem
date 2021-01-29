using arkAS.Docflow;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web;
using System.Web.Mvc;

namespace arkAS.Models.Docflow
{
    public interface IRepository : IDisposable
    {
    }
    
    public interface IDebugger
    {
        void Log(string message);
        void Log(params object[] args);
    }

    public interface IAccessManager
    {
        bool CanDo(HttpContextBase requestContext);
        bool HasPermission(HttpContextBase requestContext);
        Dictionary<string, Dictionary<string, bool>> Permissions(string userName, string roleName);
    }

    public interface IManager : IDisposable
    {
        IDebugger Debugger { get; }
        IAccessManager AccessManager { get; }
        ControllerContext Context { get; }
    }

    public interface IStatsManager : IManager
    {
        FormModel PageInit(string periodUnitName, DateTime startDate, DateTime dayToDetail);
        int CountPerPeriod(string periodUnitName, DateTime start);
        Dictionary<DateTime, object> CountPerPeriodByType(string periodUnit, DateTime start);
        Tuple<string, object[]>[] DayDetails(DateTime day);
    }

    public interface ISearchManager : IManager
    {
        SearchFormModel PageInit(string typeName, object query);
        object GetOfType(int page, int pageSize, string sort, string direction,
            Dictionary<string, string> filter, string entityName);
        object Get(string id, string entityName);
        object Details(int id, Dictionary<string, object> options);
        string Remove(int id, string entityName);
        object CreateOrModify(Dictionary<string, object> values, string entityName);
    }

    public interface IUsersManager : IManager
    {
        object[] GetUsers(Dictionary<string, object> filter);
        object AddUser(string name, string password);
        object RemoveUser(int id);
        object ChangeRole(string userGuid, string role, string username, bool turnOn);
    }

    public interface IRolesManager : IUsersManager
    {
        object[] GetRoles();
        object SaveRole(string roleName);
        object RemoveRole(string roleName);
    }

    public interface IAuthentication
    {
        IPrincipal CurrentUser { get; }
        HttpContext HttpContext { get; set; }
        bool LogIn(string login, string password, bool isPersistent);
        void LogOut();
    }
}