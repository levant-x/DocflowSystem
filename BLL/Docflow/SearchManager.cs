
using arkAS.DAL;
using arkAS.Models;
using arkAS.Models.Docflow;
using arkAS.Models.Docflow.Fundamentals;
using arkAS.Models.Docflow.ServiceProviders;
using arkAS.Models.Docflow.ServiceProviders.Helpers;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Web;

namespace arkAS.Docflow
{
    public class SearchManager : ManagerBase
    {
        private int[] _pagination = new int[] { 10, 25, 50, 100 };
        private Dictionary<string, IQueryable> itemCollections = new Dictionary<string, IQueryable>();



        public SearchManager() : base(new PseudoDataRepository())
        {
            var db = base.db as DocflowRepositoryBase;
            itemCollections.Add("contragents", db.GetContragents());
            itemCollections.Add("shippers", db.GetShippers());
            itemCollections.Add("shipments", db.GetShipments());
            itemCollections.Add("contractdocs", db.GetContractDocs());
        }


        public SearchFormModel GetDocflowCRUDForm(string entityName, object query)
        {
            var entitiesToWorkWith = new Dictionary<object, string>()
            {
                { "contragents", "Контрагент" },
                { "shippers", "Система доставки" },
                { "contractDocs", "Контракт" },
                { "shipments", "Отправление" }
            };
            entitiesToWorkWith.TryGetValue(entityName, out string selectedEntityValue);
            if (string.IsNullOrEmpty(selectedEntityValue))
                selectedEntityValue = entitiesToWorkWith.First().Value.ToString();
            var createNewLabel = DataHelper.NounDeclensor.DeclinePhrase(
                selectedEntityValue.ToLower(), "Accusative");
            
            foreach (var entityNameInLatin in entitiesToWorkWith.Keys.ToArray())
                entitiesToWorkWith[entityNameInLatin] = DataHelper.NounDeclensor
                    .DeclinePhraseInPlural(entitiesToWorkWith[entityNameInLatin]);
            var res = new SearchFormModel()
            {
                NavbarItems = new ViewControlModel(typeof(string))
                {
                    SelectedValue = entityName,
                    DomainRange = entitiesToWorkWith
                },
                CreateBtnLabel = $"Создать {createNewLabel}",
                Pagination = new ViewControlModel(typeof(string), _pagination.Cast<object>())
                {
                    Name = "page-by",
                    Label = "Выводить по"
                }
            };  
            return res;
        }

        public RequestResultBase GetItems(int pageNum, int pageSize, string sort, string direction, 
            Dictionary<string, string> filter, string selectedEntityName)
        {
            var res = new ItemsRequestResult();
            var entities = GetObjCollectionOfSelectedItemType(ref selectedEntityName);
            filter.Remove("controller");
            filter.Remove("action");
            filter?.ToList().ForEach(condition =>
            {
                entities = entities.Where(obj => DataHelper.ValueMatchesKey(obj,
                    condition.Key, condition.Value, null));
            });
            res.total = entities.Count();

            if (sort?.ToLower() == "up")
                entities = entities.OrderBy(obj => DataHelper.GetValByRefl(obj, sort, null));
            else if (sort?.ToLower() == "down")
                entities = entities.OrderByDescending(obj => DataHelper.GetValByRefl(obj, sort, null));

            if (pageNum > res.total / pageSize) pageNum = res.total / pageSize;
            else if (pageNum < 0) pageNum = 0;
            entities = entities.Skip(pageSize * (pageNum - 1)).Take(pageSize);
            res.items = entities.ToArray();
            res.foreignKeys = GetForeignKeysAsCollecsOfIDNamePairs(selectedEntityName);
            return res;
        }

        public ItemsRequestResult GetItem(string id, string selectedEntityName)
        {
            var res = new ItemsRequestResult();
            var entities = GetObjCollectionOfSelectedItemType(ref selectedEntityName);
            int.TryParse(id, out int intID);
            if (intID == 0) res.d = InstantiateItem(entities);
            else res.d = FindByID(entities, intID);
            if (res.d == null) res.msg = "Объект не найден";
            return res;
        }

        public object Details(int id, Dictionary<string, object> options)
        {
            throw new NotImplementedException();
        }

        public RequestResultBase CreateOrModifyItem(Dictionary<string, object> values, 
            string entityNameToCreateOrModify)
        {
            var res = new RequestResultBase();
            string entityName = entityNameToCreateOrModify;
            var itemsCollec = GetObjCollectionOfSelectedItemType(ref entityName);

            if (!entityNameToCreateOrModify.ToLower().Contains(entityName))
                return MarkRequestAsIncorrect(res);
            else if (!values.ContainsKey("id")) values.Add("id", 0);

            int.TryParse(values["id"].ToString(), out int id);
            var modifyingMethod = GetRepositoryAction(entityName, "Modify");
            if (id > 0 && modifyingMethod == null)
                return MarkRequestAsIncorrect(res, "Создание и редактирование невозможно!");   
            
            var item = id == 0 ? InstantiateItem(GetCollectionOfSelectedItemType(ref entityName)) :
                FindByID(itemsCollec, id);
            if (item == null) return MarkRequestAsIncorrect(res, "Объект не найден!");

            foreach (var keyValue in values)
            {
                if (keyValue.Key == "id") continue;
                DataHelper.TrySetValByRefl(item, keyValue.Key, keyValue.Value);
            }
            res = (item as DataModelBase).Validate(db);
            if (!res.result) return res;

            id = (int)modifyingMethod.Invoke(db, new object[] { item });
            if (id <= 0) res = MarkRequestAsIncorrect(res, "Не удалось сохранить объект!");
            else
            {
                res.d = item;
                res = new RequestResultBase() { d = res };
            }
            return res;
        }

        public RequestResultBase Remove(int id, string itemTypeName)
        {
            var res = new RequestResultBase() { msg = "Объект удален!" };
            var removingMethod = GetRepositoryAction(itemTypeName, "Delete");  
            if (removingMethod == null)
                return MarkRequestAsIncorrect(res, "Эти объекты удалять запрещено!");

            var collection = GetObjCollectionOfSelectedItemType(ref itemTypeName);
            var item = FindByID(collection, id); 
            if (item == null) return MarkRequestAsIncorrect(res, "Объект не найден!");

            var hasBeenRemoved = (bool)removingMethod.Invoke(db, new object[] { item });
            if (!hasBeenRemoved) MarkRequestAsIncorrect(res, "Не удалось удалить объект!");
            return res;
        }





        #region Query execution methods   
        private object FindByID(IEnumerable<object> collection, int id)
        {
            Func<object, bool> searchPredicate = (object item) 
                => DataHelper.ValueMatchesKey(item, "id", id.ToString(), null);
            return collection.FirstOrDefault(item => searchPredicate(item));
        }
        
        private object[] GetForeignKeysAsCollecsOfIDNamePairs(string childEntityName)
        {
            var res = new List<object>();
            var collecsOfFKModels = ForeignKeysModel.GetForeignKeys(childEntityName);
            if (collecsOfFKModels == null) return null;
            foreach (var fk in collecsOfFKModels)
            {
                var parentCollecName = fk.ParentCollectionName;
                if (!(db.GetType().GetMethod(parentCollecName).Invoke(db, null)
                    is IQueryable nonGenericCollec))
                    continue;
                var collec = nonGenericCollec.Cast<object>();
                // Will be used as <select> options set
                var values = collec.Select(item => new
                {
                    Value = DataHelper.GetValByRefl(item, "id", null),
                    Text = DataHelper.GetValByRefl(item, fk.PropNameToDisplayToUser, null)
                }).ToArray();
                var additionalArgs = fk.ParentCollectionName.ToLower().Contains("docstatus") ?
                    (db as DocflowRepositoryBase)?.GetDocStatuses().ToArray() : 
                    null;
                res.Add(new
                {
                    key = fk.ParentCollectionName.Replace("Get", null),
                    values,
                    additionalArgs
                });
            }
            return res.ToArray();
        }

        private object InstantiateItem(IQueryable collec)
        {
            var entityTypeToCreate = collec.GetType().GenericTypeArguments[0];
            return Activator.CreateInstance(entityTypeToCreate);
        }

        private IQueryable GetCollectionOfSelectedItemType(ref string itemTypeName)
        {
            itemTypeName = itemTypeName.Replace("as_", null).ToLower();
            itemCollections.TryGetValue(itemTypeName, out IQueryable collec);
            if (collec == null)
            {
                var keyValuePair = itemCollections.First();
                collec = keyValuePair.Value;
                itemTypeName = keyValuePair.Key;
            }
            return collec;
        }

        private IQueryable<object> GetObjCollectionOfSelectedItemType(ref string itemTypeName)
        {
            var res = GetCollectionOfSelectedItemType(ref itemTypeName).Cast<object>();
            return res;
        }

        private MethodInfo GetRepositoryAction(string entityNameToDealWith, string actionKindName)
        {

            entityNameToDealWith = entityNameToDealWith
                .Substring(0, entityNameToDealWith.Length - 2).ToLower().Replace("as_", null);
            var methodName = $"{actionKindName}{entityNameToDealWith}".ToLower();
            var res = db.GetType().GetMethods()
                .FirstOrDefault(meth => meth.Name.ToLower().Contains(methodName));
            return res;
        }

        private RequestResultBase MarkRequestAsIncorrect(RequestResultBase res, string msg = null)
        {
            msg = msg ??  "Запрос некорректный!";
            res.result = false;
            res.msg = msg;
            return res;
        }
        #endregion
    }
}