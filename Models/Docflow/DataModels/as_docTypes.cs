namespace arkAS.Models
{
    using arkAS.Models.Docflow.Fundamentals;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Serializable]
    public class as_docTypes : DataModelBase
    {
        public int id { get; set; }

        [Required]
        [StringLength(20)]
        [Display(Name = "��������")]
        public string name { get; set; }
    }
}
