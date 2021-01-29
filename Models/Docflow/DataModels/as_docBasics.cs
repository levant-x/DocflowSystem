namespace arkAS.Models
{
    using arkAS.Docflow;
    using arkAS.Models.Docflow.Fundamentals;
    using DapperExtensions.Mapper;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Serializable]
    public class as_docBasics : DataModelBase
    {
        public int id { get; set; }

        [Column(TypeName = "date")]
        [Display(Name = "Дата")]
        public DateTime date { get; set; }
        
        [Display(Name = "Контрагент")]
        public int contragentID { get; set; }

        [IgnoreRecurseValidation]
        public virtual as_contragents as_contragent { get; set; } = new as_contragents();




        public class DocBasicMapper : ClassMapper<as_docBasics>
        {
            public DocBasicMapper()
            {
                Map(f => f.as_contragent).Ignore();
                AutoMap();
            }
        }
    }
}
