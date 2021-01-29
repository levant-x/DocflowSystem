using arkAS.Docflow;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace arkAS.Models.Docflow.ServiceProviders.Helpers
{
    public class ModelValidator : IDisposable
    {
        private static DocflowRepositoryBase _db;
        private static object _currentValidatedItem;

        static private string _SHIPPER_KEY = "shipper";
        static private string _SHIPMENT_KEY = "shipment";
        static private string _CONTRAGENT_KEY = "contragent";
        static private string _CONTRACT_DOC_KEY = "contractDoc";
        static private string _DOC_STATUS_KEY = "docStatus";

        protected static Dictionary<string, ModelValidator> allValidatorsDict = 
            new Dictionary<string, ModelValidator>();
        protected Dictionary<string, Func<object, string>> modelValidatorsDict =
            new Dictionary<string, Func<object, string>>();



        static ModelValidator()
        {
            allValidatorsDict.Add(_CONTRAGENT_KEY, new ModelValidator());
            allValidatorsDict.Add(_SHIPPER_KEY, new ModelValidator());
            allValidatorsDict.Add(_SHIPMENT_KEY, new ModelValidator());
            allValidatorsDict.Add(_CONTRACT_DOC_KEY, new ModelValidator());
            allValidatorsDict.Add(_DOC_STATUS_KEY, new ModelValidator());

            allValidatorsDict[_CONTRAGENT_KEY].modelValidatorsDict.Add("name", (object val) =>
            {
                if (val.ToString().Length > 256) return "Длина названия превышает 256 символов!";
                else return null;
            });

            allValidatorsDict[_SHIPPER_KEY].modelValidatorsDict.Add("name", (object val) =>
            {
                if (val.ToString().Length > 50) return "Длина названия превышает 50 символов!";
                else return null;
            });

            #region For docStatuses
            allValidatorsDict[_DOC_STATUS_KEY].modelValidatorsDict.Add("name", (object val) =>
            {
                if (val.ToString().Length > 50) return "Длина названия превышает 50 символов!";
                else return null;
            });
            allValidatorsDict[_SHIPMENT_KEY].modelValidatorsDict.Add("docTypeNames", (object val) =>
            {
                if (val.ToString().Length > 150) return "Длина списка названий целевых документов " +
                    "превышает 256 символов!";
                else return null;
            });
            #endregion

            #region For shipments
            allValidatorsDict[_SHIPMENT_KEY].modelValidatorsDict.Add("fromPerson", (object val) =>
            {
                if (val.ToString().Length > 100) return "Длина отправителя превышает 100 символов!";
                else return null;
            });
            allValidatorsDict[_SHIPMENT_KEY].modelValidatorsDict.Add("toAddr", (object val) =>
            {
                if (val.ToString().Length > 256) return "Длина адреса получателя превышает 256 символов!";
                else return null;
            });
            allValidatorsDict[_SHIPMENT_KEY].modelValidatorsDict.Add("descr", (object val) =>
            {
                if (val.ToString().Length > 256) return "Длина описания превышает 256 символов!";
                else return null;
            });
            allValidatorsDict["trackNum"].modelValidatorsDict.Add("descr", (object val) =>
            {
                if (val.ToString().Length > 20) return "Длина трек-номера превышает 20 символов!";
                else return null;
            });
            allValidatorsDict["trackNum"].modelValidatorsDict.Add("statusID", (object val) =>
            {
                int.TryParse(val?.ToString(), out int id);
                if (!IsStatusApplicableToDoc("shipment", id)) return "Статус не указан или указан некорректный!";
                else return null;
            });
            #endregion

            #region For ContractDocs
            allValidatorsDict[_CONTRACT_DOC_KEY].modelValidatorsDict.Add("code", (object val) =>
            {
                if (val.ToString().Length > 50) return "Длина кода превышает 50 символов!";
                else return null;
            });
            allValidatorsDict[_CONTRACT_DOC_KEY].modelValidatorsDict.Add("note", (object val) =>
            {
                if (val.ToString().Length > 256) return "Длина заметки превышает 256 символов!";
                else return null;
            });
            allValidatorsDict[_SHIPMENT_KEY].modelValidatorsDict.Add("statusID", (object val) =>
            {
                var docTypeID = DataHelper.GetValByRefl(_currentValidatedItem, "docTypeID");
                int.TryParse(docTypeID?.ToString(), out int intDocTypeID);
                var docTypeModel = _db.GetDocTypes().FirstOrDefault(type => type.id == intDocTypeID);
                string docTypeName = docTypeModel?.name;
                int.TryParse(val?.ToString(), out int id);
                if (!IsStatusApplicableToDoc(docTypeName, id)) return "Статус не задан или некорректный!";
                else return null;
            });
            #endregion
        }



        public static ModelValidator GetValidatorsForEntity(string entityName, DocflowRepositoryBase db,
            object currentItem)
        {
            _db = db;
            _currentValidatedItem = currentItem;
            return allValidatorsDict[entityName] ?? new ModelValidator();
        }

        public RequestResultBase CheckValue(string propertyName, object value)
        {
            var res = new RequestResultBase() { result = true };
            if (!modelValidatorsDict.ContainsKey(propertyName)) return res;
            var validationMethod = modelValidatorsDict[propertyName];
            var errorText = validationMethod(propertyName);
            if (errorText != null)
            {
                res.result = false;
                res.msg = errorText;
            }
            return res;
        }

        public void Dispose()
        {
            _db = null;
        }


        private static bool IsStatusApplicableToDoc(string docTypeName, int statusID)
        {
            if (string.IsNullOrEmpty(docTypeName)) return false; // mandatory argument
            var docStatusModel = _db.GetDocStatuses().FirstOrDefault(status => status.id == statusID);
            if (docStatusModel == null) return false; // no such status
            var docStatusApplicableNamesArray = (docStatusModel.docTypeNames ?? docTypeName)
                .Split(',');
            string restrictedDocTypeName = docStatusApplicableNamesArray
                .FirstOrDefault(name => name.Contains(docTypeName));
            return restrictedDocTypeName != null ^ docStatusModel.allowForListedTypes; 
            // document type not mentioned in a white list or mentioned in a black one = false
        }
    }
}