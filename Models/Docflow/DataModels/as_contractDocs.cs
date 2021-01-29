namespace arkAS.Models
{
    using arkAS.Docflow;
    using arkAS.Models.Docflow;
    using arkAS.Models.Docflow.Fundamentals;
    using arkAS.Models.Docflow.ServiceProviders;
    using arkAS.Models.Docflow.ServiceProviders.Helpers;
    using DapperExtensions.Mapper;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;
    using System.Linq;
    using System.Reflection;

    [Serializable]
    public class as_contractDocs : DocumentModelBase
    {
        public int id { get; set; }
                
        [StringLength(50)]
        [Display(Name = "Код")]
        public string code { get; set; }

        [Required]
        [Display(Name = "Тип")]
        public int typeID { get; set; }

        public int docBasicID { get; set; }

        [Display(Name = "Сумма")]
        public double? total { get; set; }

        [StringLength(256)]
        [Display(Name = "Заметка")]
        public string note { get; set; }

        [Required]
        [Display(Name = "Статус")]
        public int statusID { get; set; }

        public virtual as_docBasics as_docBasic { get; set; } = new as_docBasics();

        [IgnoreRecurseValidation]
        public virtual as_docStatuses as_docStatus { get; set; } = new as_docStatuses();

        [IgnoreRecurseValidation]
        public virtual as_docTypes as_docType { get; set; } = new as_docTypes();

        public virtual as_contractFiles as_contractFile { get; set; } = new as_contractFiles();



        public as_contractDocs()
        {
            var typeIDProp = GetType().GetProperty("typeID");
            RegisterCustomValidator(ValidateDocTypeBasedProps, typeIDProp);
        }



        public class ContractMapper : ClassMapper<as_contractDocs>
        {
            public ContractMapper()
            {
                Map(f => f.as_docStatus).Ignore();
                Map(f => f.as_docType).Ignore();
                Map(f => f.as_docBasic).Ignore();
                Map(f => f.as_contractFile).Ignore();
                AutoMap();
            }
        }

        protected RequestResultBase ValidateDocTypeBasedProps(object value, IRepository db)
        {
            var res = new RequestResultBase();
            var docflowRepository = db as DocflowRepositoryBase;
            as_docType = docflowRepository.GetDocTypes()
                .FirstOrDefault(type => type.id == typeID);
            if (as_docType == null)
            {
                MarkValidationError(res, "Указан несуществующий тип!");
                return res;
            }

            if (as_docType.name != "Договор") as_contractFile = new as_contractFiles();
            else if (as_docType.name != "Счет") total = null;
            return res;
        }
    }
}
