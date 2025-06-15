using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("support")]
    public class Support
    {
        [Key]
        [Column("idsupport")]
        public int Idsupport { get; set; }

        [Column("idtypesupport")]
        public int Idtypesupport { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("idcourse")]
        public long Idcourse { get; set; }

        [Column("idusername")]
        public long Idusername { get; set; }

        [Column("idtypestatussupport")]
        public int Idtypestatussupport { get; set; }


        public TypeSupport TypeSupport { get; set; }
        public Course Course { get; set; }
        public Username User { get; set; }
        public TypeStatusSupport TypeStatusSupport { get; set; }
    }
}