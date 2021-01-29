
using arkAS.Models;
using arkAS.Models.Docflow;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace arkAS.Docflow
{
    /// <summary>
    /// Содержит описания типов всех моделей. После создания хранится статически.
    /// Создается гарантированно для каждого типа
    /// </summary>
    public class ModelDescriptor
    {
        public class FKModel
        {
            public Type Type { get; set; }
            public string Name { get; set; }
        }

        private static Dictionary<Type, ModelDescriptor> _descriptors =
            new Dictionary<Type, ModelDescriptor>();

        protected Type entityType;
        protected IRepository db;
        private Dictionary<string, PropertyInfo> _atomarProps =
            new Dictionary<string, PropertyInfo>();

        public FKModel[] ForeignKeys { get; private set; } 
        public ViewControlModel[] PropViewModels { get; private set; }


        public ModelDescriptor(Type typeToInspect)
        {
            entityType = typeToInspect;
            CheckInModelType(entityType, null);
            var toRegisterThis = !_descriptors.ContainsKey(typeToInspect);
            if (toRegisterThis) _descriptors.Add(typeToInspect, this);

            if (entityType == typeof(as_contractDocs))
            {
                ForeignKeys = new FKModel[1].Concat(ForeignKeys).ToArray();
                ForeignKeys[0] = new FKModel()
                { Name = "as_contragents", Type = typeof(as_contragents) };
            }
        }

        public static ModelDescriptor Get(Type entityType)
        {
            if (entityType == null) return null;
            _descriptors.TryGetValue(entityType, out ModelDescriptor res);
            if (res == null) res = new ModelDescriptor(entityType);
            return res;
        }

        public PropertyInfo Prop(string name)
        {
            _atomarProps.TryGetValue(name, out PropertyInfo res);
            return res;
        }

        public virtual object Create()
        {
            var res = Activator.CreateInstance(entityType);
            CreateFKS(res);
            DataHelper.TrySetValByRefl(res, "date", DateTime.Now);
            return res;
        }

        public virtual object Validate(object item, IRepository db)
        {
            return item;
        }

        protected void CreateFKS(object target)
        {
            var fks = Get(target?.GetType())?.ForeignKeys;
            if (fks == null) return;
            foreach (var fk in fks)
            {
                var value = Activator.CreateInstance(fk.Type);
                DataHelper.TrySetValByRefl(target, fk.Name, value);
                DataHelper.TrySetValByRefl(target, "date", DateTime.Now);
                CreateFKS(DataHelper.GetValByRefl(target, fk.Name));
            }
        }
        
        protected bool BasicSetToContract(object target, FKModel fk)
        {
            if (fk.Type != typeof(as_contragents) ||
                target.GetType() != typeof(as_contractDocs)) return false;
            var basic = new as_docBasics()
            { as_contragent = new as_contragents() };
            DataHelper.TrySetValByRefl(target, "as_docBasic", basic);
            return true;
        }
        protected void ReplaceDescriptor(ModelDescriptor descriptor)
        {
            if (_descriptors.ContainsKey(descriptor.entityType))
            {
                _descriptors.Remove(descriptor.entityType);
            }
            _descriptors.Add(descriptor.entityType, descriptor);
        }

        protected void RegisterResolver(ModelDescriptor resolver, Type type)
        {
            if (!_descriptors.ContainsKey(type)) _descriptors.Add(type, resolver);
        }

        public void CheckInModelType(Type entityType, Type parent)
        {
            var propModels = new List<ViewControlModel>();
            var fkeys = new List<FKModel>();

            foreach (var prop in entityType.GetProperties())
            {
                string key = prop.Name;
                if (key == "id") continue;

                var propType = prop.PropertyType;

                if (propType.IsClass && propType != typeof(string))
                {
                    new ModelDescriptor(propType);
                    CheckInModelType(propType, entityType);
                    fkeys.Add(new FKModel() { Type = propType, Name = key });
                }
                else
                {
                    _descriptors.TryGetValue(entityType, out ModelDescriptor theSameThis);
                    if (theSameThis != null) return;

                    if (!_atomarProps.ContainsKey(key)) _atomarProps.Add(key, prop);
                    propModels.Add(CreatePropModel(prop, entityType, parent));
                }
            }
            PropViewModels = propModels.ToArray();
            ForeignKeys = fkeys.ToArray();
        }

        private ViewControlModel CreatePropModel(PropertyInfo prop, Type owner, Type parent)
        {
            string propLabel = DataHelper.GetCustomNameFor(prop);
            string parentLabel = string.Empty;
            string parentName = parent == null ? string.Empty : $"{parent.Name}.";
            if (parent != null)
            {
                string parentTestName = DataHelper.GetCustomNameFor(parent);
                if (parentTestName == parent.Name)
                { parentTestName = DataHelper.GetCustomNameFor(owner); }

                parentLabel = DataHelper.NounDeclensor.DeclineNoun(parentTestName,
                    "Genitive");
                parentLabel = $" {parentLabel}";
            }
            return new ViewControlModel(prop.PropertyType)
            {
                Label = string.Concat(propLabel, parentLabel),
                Name = string.Concat(parentName, prop.Name)
            };
        }
    }
}