
using Ninject;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace arkAS.Models.Docflow
{
    public class ManagerBase : IManager
    {
        protected bool isDisposed = false;

        protected IRepository db;  

        [Inject]
        public IDebugger Debugger { get; set; }

        public IAccessManager AccessManager { get; protected set; }

        public ControllerContext Context { get; set; }



        public ManagerBase(IRepository db)
        {
            //AccessManager = new AccessManager();
            this.db = db;
        }


        #region System
        public virtual void Dispose(bool isDisposing)
        {
            if (!isDisposed)
            {
                if (isDisposing)
                {
                    db.Dispose();
                }
                isDisposed = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        #endregion
    }
}