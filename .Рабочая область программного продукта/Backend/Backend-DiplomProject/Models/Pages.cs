using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("pages")]
    public class Pages
    {
        [Key]
        [Column("idpages")]
        public long Idpages { get; set; }

        [Column("numberpage")]
        public int Numberpage { get; set; }

        [Column("file")]
        public byte[] File { get; set; }

        [Column("idcourse")]
        public long Idcourse { get; set; }

        public Course Course { get; set; }
    }
}
