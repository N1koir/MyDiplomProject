using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("typestatussupport")]
    public class TypeStatusSupport
    {
        [Key]
        [Column("idtypestatussupport")]
        public int Idtypestatussupport { get; set; }

        [Column("type")]
        public string Type { get; set; }
    }
}