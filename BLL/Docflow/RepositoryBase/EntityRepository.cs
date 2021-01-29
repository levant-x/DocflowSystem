
using arkAS.Models.Docflow;
using DapperExtensions;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Common;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace arkAS.DAL
{
    public class EntityRepository<T> : IDisposable where T : class 
    {
        private DbConnection _connc;
        private IDebugger _debugger;
        protected bool isDisposed = false;

        public EntityRepository(DbConnection connection, IDebugger debugger)
        {
            _connc = connection;
            _debugger = debugger;
        } 

        public IQueryable<T> GetItems() 
        {
            var res = CallDB(() => _connc.GetList<T>());
            return res as IQueryable<T>;
        }

        public T GetItem(long id)
        {
            var res = CallDB(() => _connc.Get<T>(id));
            return res as T;
        }

        public long CreateItem(T item)
        {            
            int id = _connc.Insert(item);
            return id;
        }

        public bool UpdateItem(T item)
        {
            bool res = (bool)CallDB(() => _connc.Update(item));
            return res;
        }

        public bool DeleteItem(T item)
        {
            bool res = (bool)CallDB(() => _connc.Delete(item));
            return res;
        }

        private object CallDB(Func<object> action)
        {
            using (_connc)
            {
                return action();
            }
        }

        #region System   
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (isDisposed)
            {
                return;
            }
            if (disposing)
            {
                _connc?.Dispose();
            }
            _connc = null;
            isDisposed = true;
        }
        #endregion
    }
}