namespace arkAS.Models
{
    using arkAS.Docflow;
    using arkAS.Models.Docflow.Fundamentals;
    using arkAS.Models.Docflow.ServiceProviders.Helpers;
    using DapperExtensions.Mapper;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;
    using System.Data.Entity.Spatial;

    [Serializable]
    public class as_shipments : DocumentModelBase
    {
        public int id { get; set; }

        [Column(TypeName = "����")]
        public DateTime date { get; set; } = DateTime.Now;

        [Required]
        [StringLength(100)]
        [Display(Name = "�����������")]
        public string fromPerson { get; set; }

        [Required]
        [StringLength(256)]
        [Display(Name = "����� ����������")]
        public string toAddr { get; set; }

        [StringLength(256)]
        [Display(Name = "��������")]
        public string descr { get; set; }

        [Required]
        [Display(Name = "������� �����������")]
        public int shipperID { get; set; }

        [Required]
        [StringLength(20)]
        [Display(Name = "����-�����")]
        public string trackNum { get; set; }

        [Required]
        [Display(Name = "������")]
        public int statusID { get; set; }

        [IgnoreRecurseValidation]
        public virtual as_docStatuses as_docStatus { get; set; } = new as_docStatuses();

        [IgnoreRecurseValidation]
        public virtual as_shippers as_shipper { get; set; } = new as_shippers();





        public class ShipmentMapper : ClassMapper<as_shipments>
        {
            public ShipmentMapper()
            {
                Map(f => f.as_docStatus).Ignore();
                Map(f => f.as_shipper).Ignore();
                AutoMap();
            }
        }
    }
}
