using arkAS.Docflow;
using arkAS.Models.Docflow.ServiceProviders;
using Glimpse.Core.Extensibility;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web.Mvc;
using System.Web;
using System.Reflection;

namespace arkAS.Models.Docflow.Fundamentals
{
    [Serializable]
    public abstract class DataModelBase
    {
        private Dictionary<PropertyInfo, Func<object, IRepository, RequestResultBase>> 
            _customValidationProcedures =
            new Dictionary<PropertyInfo, Func<object, IRepository, RequestResultBase>>();
        private int recurseStep = 0;

        public RequestResultBase Validate(IRepository db)
        {
            var res = new RequestResultBase() { result = true };
            foreach (var property in GetType().GetProperties())
            {
                if (property.Name == "id") continue;
                var propValue = property.GetValue(this);
                if (propValue is DataModelBase nestedProperty)
                {
                    if (ToSkipOnRecurseValidation(property)) continue;
                    recurseStep++;
                    var intermediateRes = nestedProperty.Validate(db);
                    recurseStep--;
                    if (!intermediateRes.result) MarkValidationError(res, intermediateRes.msg);
                }
                else if (!IsRequiredValueSet(property, propValue))
                {
                    var propertyName = GetPropertyNameInGenitive(property);
                    MarkValidationError(res, $"Значение {propertyName} не задано!");
                }
                else CheckStringLength(res, property, propValue);
                if (_customValidationProcedures.ContainsKey(property))
                {
                    var intermediateRes = _customValidationProcedures[property](propValue, db);
                    if (!intermediateRes.result) MarkValidationError(res, intermediateRes.msg);
                }
            }
            return res;
        }

        public virtual void CustomizeDapperProperties() { }



        protected void RegisterCustomValidator(Func<object, IRepository, RequestResultBase> func,
            PropertyInfo propertyInfo)
        {
            if (!_customValidationProcedures.ContainsKey(propertyInfo))
            {
                _customValidationProcedures.Add(propertyInfo, func);
            }
        }

        protected string GetPropertyNameInGenitive(PropertyInfo property)
        {
            var displayAttribute = property.GetCustomAttribute(typeof(DisplayAttribute), true);
            var nameFromAttribute = (displayAttribute as DisplayAttribute)?.Name;
            var propertyName = nameFromAttribute == null ? property.Name.ToLower() :
                DataHelper.NounDeclensor.DeclinePhrase(nameFromAttribute, "Genitive").ToLower();
            return propertyName;
        }

        protected void MarkValidationError(RequestResultBase baseRes, string msg)
        {
            baseRes.result = false;
            baseRes.msg += "\r\n" + msg;
        }



        private bool ToSkipOnRecurseValidation(PropertyInfo property)
        {
            var ignoreRecurseValidation = property
                .GetCustomAttribute(typeof(IgnoreRecurseValidationAttribute));
            return ignoreRecurseValidation != null;
        }

        private bool IsRequiredValueSet(PropertyInfo property, object itsValue)
        {
            var isRequired = IsValueRequired(property);
            if (!isRequired) return true;
            var res = property.PropertyType.IsClass && itsValue != null ||
                property.PropertyType.IsValueType && !itsValue.Equals(Activator
                    .CreateInstance(property.PropertyType));
            return res;
        }

        private bool IsValueRequired(PropertyInfo property)
        {
            var res = property.GetCustomAttribute(typeof(RequiredAttribute)) != null;
            return res;
        }

        private void CheckStringLength(RequestResultBase res, PropertyInfo property, object value)
        {
            var lengthAttribute = property.GetCustomAttribute(typeof(StringLengthAttribute), true);            
            int? maxLength = (lengthAttribute as StringLengthAttribute)?.MaximumLength;
            if (maxLength == null) return;
            else if (value?.ToString().Length > maxLength)
            {
                var propertyName = GetPropertyNameInGenitive(property);
                var declinedCharsWord = DataHelper.NounDeclensor.HowManyOf("символ", maxLength.Value);
                string msg = $"Длина {propertyName} превышает {maxLength} {declinedCharsWord}!";
                MarkValidationError(res, msg);
            }
        }
    }
}