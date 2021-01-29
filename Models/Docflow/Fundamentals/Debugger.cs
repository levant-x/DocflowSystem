using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Elmah;

namespace arkAS.Models.Docflow
{
    public class Debugger : IDebugger
    {
        public void Log(string message)
        {

        }

        public void Log(params object[] args)
        {
            throw new NotImplementedException();
        }
    }
}