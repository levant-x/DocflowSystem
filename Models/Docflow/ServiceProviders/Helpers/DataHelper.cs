
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Web;

namespace arkAS.Docflow
{
    public static class DataHelper
    {
        public static readonly NounDeclensor NounDeclensor = NounDeclensor.Instance;

               

        public static string GetCustomNameFor(Type type)
        {
            var label = GetDML(type);
            string customName = GetAttributeVal(label, "DisplayName") as string;
            return customName ?? type.Name;
        }

        public static string GetCustomNameFor(PropertyInfo prop)
        {
            var label = GetDML(prop);
            string customName = GetAttributeVal(label, "DisplayName") as string;
            return customName ?? prop.Name;
        }

        public static object GetValByRefl(object target, string key, Type targType = null)
        {
            key = key?.Replace('-', '.');
            var valueSource = GetProp(ref target, key, targType);
            if (valueSource == null) return null;
            var res = valueSource.GetValue(target);
            return res ?? null;
        }

        public static void TrySetValByRefl(object target, string key, object value)
        {
            key = key?.Replace('-', '.');
            var valueSource = GetProp(ref target, key, null);
            if (valueSource == null) return;
            try
            {
                var convertedVal = ConvertTo(valueSource.PropertyType, value);
                valueSource.SetValue(target, convertedVal);
            }
            catch (Exception e) { }

        }

        public static bool ValueMatchesKey(object target, string key, string value, Type targType = null)
        {
            if (string.IsNullOrEmpty(value)) return true;
            key = key?.Replace('-', '.');
            var propValue = GetValByRefl(target, key, targType);
            if (propValue == null) return true;
            value = value.ToLower();
            if (propValue is string str) return str.ToLower().Contains(value);

            var valueSource = GetProp(ref target, key);
            var etalon = ConvertTo(valueSource.PropertyType, value);
            if (valueSource.PropertyType == typeof(DateTime))
            { return ((DateTime)propValue).Date == ((DateTime)etalon).Date; }
            var res = propValue.Equals(etalon);
            return res;
        }

        private static CustomAttributeData GetDML(MemberInfo memInfo)
        {
            var res = memInfo.CustomAttributes.FirstOrDefault(attr
                => attr.AttributeType == typeof(DataModelLabelAttribute));
            return res;
        }

        private static object GetAttributeVal(CustomAttributeData attributeData, string propName)
        {
            var res = attributeData?.NamedArguments
                .FirstOrDefault(arg => arg.MemberName == propName);
            return res?.TypedValue.Value;
        }

        private static PropertyInfo GetProp(ref object target, string key, Type targType = null)
        {
            targType = targType ?? target.GetType();
            var res = targType.GetProperty(key);
            if (key.Contains('.'))
            {
                string subKey = key.Substring(0, key.IndexOf('.'));
                key = key.Replace($"{subKey}.", null);
                var subType = targType ?? target.GetType();
                target = subType.GetProperty(subKey)?.GetValue(target);
                if (target == null) return null;
                res = GetProp(ref target, key, target.GetType());
            }
            else if (res == null) res = ModelDescriptor.Get(targType).Prop(key);
            return res;
        }

        private static object ConvertTo(Type type, object value)
        {
            try
            {
                if (type.Name.ToLower().Contains("nullable"))
                { return TypeDescriptor.GetConverter(type).ConvertFrom(value); }
                return Convert.ChangeType(value, type);
            }
            catch (Exception e)
            {
                if (type.IsValueType) return Activator.CreateInstance(type);
                return value;
            }
        }

        private static bool IsBetween(IComparable value, object min, object max)
        {
            int? moreEqu = value?.CompareTo(min), lessEqu = value?.CompareTo(max);
            return moreEqu >= 0 && lessEqu <= 0;
        }
    }
}