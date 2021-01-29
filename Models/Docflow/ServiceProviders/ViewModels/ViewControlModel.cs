using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace arkAS.Docflow
{
    /// <summary>
    /// Для описания всех свойств сущности (в т.ч. вложенных) и настройки 
    /// элементов управления для них
    /// </summary>
    public class ViewControlModel
    {
        protected Type type = null;
        protected object selectedValue;
        protected bool isMultySelect = false;
        private string _htmlInputTypeName = string.Empty;
        private static string[] _numericals = new string[]
        { "int", "double", "float", "decimal" };
        private object _min;
        private object _max;

        public string Name { get; set; }
        public string Label { get; set; }
        public bool NeedTime { get; set; } = false;
        public object Min { get => _min; set => SetValue(ref _min, value); }
        public object Max { get => _max; set => SetValue(ref _max, value); }

        public bool IsValueType
        {
            get => type?.IsValueType == true;
        }

        public bool IsDiscrete
        {
            get => DomainRange.Count > 0;
        }

        public bool IsMultySelect
        {
            get => IsDiscrete ? isMultySelect : false;
            set => isMultySelect = value;
        }

        public Dictionary<object, string> DomainRange { get; set; } =
            new Dictionary<object, string>();

        public virtual object SelectedValue
        {
            get
            {
                bool mustBeAnOption = DomainRange.Count > 0 &&
                    (selectedValue == null || !DomainRange.ContainsKey(selectedValue));
                if (mustBeAnOption)
                {
                    return DomainRange.Keys.FirstOrDefault();
                }
                else
                {
                    if (selectedValue?.GetType() == typeof(DateTime))
                    {
                        return ((DateTime)selectedValue).ToString("yyyy-MM-dd");
                    }
                    return selectedValue;
                }                
            }
            set
            {
                if (IsDiscrete && IsMultySelect && value is IEnumerable<object> arr)
                {
                    selectedValue = DomainRange.Keys.Intersect(arr);
                }
                else if (!IsDiscrete || IsDiscrete && DomainRange.ContainsKey(value))
                {
                    SetValue(ref selectedValue, value);
                }
            }
        }

        public virtual string HtmlInputTypeName
        {
            get
            {
                if (_htmlInputTypeName != string.Empty)
                {
                    return _htmlInputTypeName;
                }
                string lwCsName = type.Name.ToLower();

                if (lwCsName == "datetime")
                {
                    return NeedTime ? lwCsName : "date";
                }
                else if (_numericals.Any(num => lwCsName.Contains(num)))
                {
                    return "number";
                }
                else return "text";
            }
            set
            {
                if (!string.IsNullOrEmpty(value)) _htmlInputTypeName = value;
            }
        }


        private void SetDomainRange(IEnumerable<object> input)
        {
            foreach (var item in input)
            {
                if (item is KeyValuePair<object, string> kvp)
                {
                    DomainRange.Add(kvp.Key, kvp.Value);
                }
                else
                {
                    DomainRange.Add(item, item.ToString());
                }
            }
        }



        public ViewControlModel(Type type)
        {
            this.type = type;
        }


        public ViewControlModel(IEnumerable<object> domainRange)
        {
            SetDomainRange(domainRange);
        }



        public ViewControlModel(Type type, IEnumerable<object> domainRange)
        {
            this.type = type;
            SetDomainRange(domainRange);
        }

        private void SetValue(ref object target, object value)
        {
            if (type == null) { target = value; return; }
            try
            {
                target = Convert.ChangeType(value, type);
            }
            catch (Exception) { }
        }
    }
}