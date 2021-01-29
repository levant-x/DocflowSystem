namespace arkAS.Models
{
    using arkAS.Models.Docflow.Fundamentals;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Serializable]
    public class as_contractFiles : DataModelBase
    {
        public int id { get; set; }
                
        [StringLength(256)]
        [Display(Name = "—сылка")]
        public string link { get; set; }
        
        public int contractDocID { get; set; }
    }
}
