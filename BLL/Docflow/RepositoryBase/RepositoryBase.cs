using arkAS.Models.Docflow;
using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Linq;
using System.Web;

namespace arkAS.DAL
{
    public class RepositoryBase<T> : EntityRepository<T>, IRepository where T : class
    {
        public RepositoryBase(DbConnection dbConnection, IDebugger debugger)
            : base(dbConnection, debugger)
        { }

        new public long CreateItem(T item)
        {
            var itemProps = item.GetType().GetProperties();
            var idProp = itemProps.First(prop => prop.Name.ToLower().Contains("id"));
            var id = idProp.GetValue(item);
            var existing = GetItem(Convert.ToInt64(id));

            if (existing == null)
            {
                id = base.CreateItem(item);                
            }
            else
            {
                UpdateItem(item);
            }
            return Convert.ToInt64(id);
        }
    }
}