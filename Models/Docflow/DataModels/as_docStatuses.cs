namespace arkAS.Models
{
    using arkAS.Models.Docflow.Fundamentals;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Serializable]
    public class as_docStatuses : DataModelBase
    {
        public int id { get; set; }

        [Required]
        [StringLength(50)]
        [Display(Name = "Название")]
        public string name { get; set; }

        [StringLength(150)]
        [Display(Name = "Список целевых документов")]
        public string docTypeNames { get; set; }

        [Display(Name = "Является ли список разрешающим")]
        public bool allowForListedTypes { get; set; }
    }
}
