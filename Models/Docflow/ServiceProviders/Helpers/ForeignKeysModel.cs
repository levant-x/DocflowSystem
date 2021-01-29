using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace arkAS.Models.Docflow.ServiceProviders.Helpers
{
    public class ForeignKeysModel
    {
        static Dictionary<string, ForeignKeysModel[]> foreignKeys =
            new Dictionary<string, ForeignKeysModel[]>();

        public string ParentCollectionName { get; set; }
        public string PropNameToDisplayToUser { get; set; } = "name";



        static ForeignKeysModel()
        {
            foreignKeys.Add("shipments", new ForeignKeysModel[]
            {
                new ForeignKeysModel() { ParentCollectionName = "GetDocStatuses" },
                new ForeignKeysModel() { ParentCollectionName = "GetShippers" }
            });
            foreignKeys.Add("contractdocs", new ForeignKeysModel[]
            {
                new ForeignKeysModel() { ParentCollectionName = "GetDocStatuses" },
                new ForeignKeysModel() { ParentCollectionName = "GetDocTypes" },
                new ForeignKeysModel() { ParentCollectionName = "GetContragents" }
            });
        }



        public static ForeignKeysModel[] GetForeignKeys(string entityCollecName)
        {
            foreignKeys.TryGetValue(entityCollecName, out ForeignKeysModel[] res);
            return res;
        }
    }
}