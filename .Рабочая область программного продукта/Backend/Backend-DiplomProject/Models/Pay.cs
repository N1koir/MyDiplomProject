using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("pay")]
    public class Pay
    {
        [Key]
        [Column("idpay")]
        public long Idpay { get; set; }

        [Column("idcourse")]
        public long Idcourse { get; set; }

        [Column("idusername")]
        public long Idusername { get; set; }


        public Course Course { get; set; }

        public Username User { get; set; }
    }
}
