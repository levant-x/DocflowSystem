using arkAS.Docflow;
using arkAS.Models.Docflow.Fundamentals;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Web;

namespace arkAS.Models.Docflow.ServiceProviders.Helpers
{
    [Serializable]
    public abstract class DocumentModelBase : DataModelBase
    {
        public DocumentModelBase()
        {
            var statusProp = GetType().GetProperty("statusID");
            if (statusProp == null) throw new Exception("This type of object does not obtain any status!");
            else RegisterCustomValidator(ValidateDocStatus, statusProp);
        }



        protected RequestResultBase ValidateDocStatus(object propertyValue, IRepository db)
        {
            var docflowRepository = db as DocflowRepositoryBase;
            if (docflowRepository == null) throw new ArgumentException("Incorrect repository type!");
            int statusID = int.Parse(propertyValue.ToString());
            var res = new RequestResultBase();

            var docTypeID = (int)GetType().GetProperty("typeID")?.GetValue(this);
            var docTypeName = string.Empty;
            if (GetType().Name == "as_shipments") docTypeName = "Отправление";
            else if (GetType().Name == "as_contractDocs")
            {
                docTypeName = GetContractDocTypeName(res, docflowRepository, docTypeID);
                if (docTypeName == null) return res;
            }

            var docStatusModel = docflowRepository.GetDocStatuses()
                .FirstOrDefault(status => status.id == statusID);
            if (docStatusModel == null)
            {
                MarkValidationError(res, "Указанного статуса не существует!");
                return res;
            }
            var docStatusApplicableNamesArray = (docStatusModel.docTypeNames ?? docTypeName)
                .Split(',');
            string restrictedDocTypeName = docStatusApplicableNamesArray
                .FirstOrDefault(name => name.Contains(docTypeName));
            if (restrictedDocTypeName != null ^ docStatusModel.allowForListedTypes)
                MarkValidationError(res, "Данный тип документа не может иметь указанный статус!");
            return res;
        }

        private string GetContractDocTypeName(RequestResultBase requestResult, DocflowRepositoryBase db, int id)
        {
            var docTypeModel = db.GetDocTypes().FirstOrDefault(type => type.id == id);
            if (docTypeModel == null)
            {
                MarkValidationError(requestResult, "Указан несуществующий тип документа!");
                return null;
            }
            return docTypeModel.name;
        }
    }
}