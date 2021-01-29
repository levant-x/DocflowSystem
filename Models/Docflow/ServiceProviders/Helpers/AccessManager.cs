
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Web;
using System.Web.Security;

namespace arkAS.Models.Docflow
{
    public class AccessManager : IAccessManager
    {
        IPrincipal currentUser;

        public AccessManager()
        {
            //currentUser = Membership.Provider.ApplicationName;
        }


        public bool CanDo(HttpContextBase requestContext)
        {
            var user = Membership.GetAllUsers();
            var r = Membership.Provider;
            var rr = Membership.Providers;

            var tt = RolePrincipal.Current;

            return true;
        }

        public bool HasPermission(HttpContextBase requestContext)
        {
            if (!requestContext.User.Identity.IsAuthenticated)
                return false;
            return true;
            //var user = Membership.GetAllUsers();
            //var r = Membership.Provider;

            //var tre = requestContext.Request.Form;

        }

        public Dictionary<string, Dictionary<string, bool>> Permissions(string userName, string roleName)
        {
            throw new NotImplementedException();
        }


    }
}