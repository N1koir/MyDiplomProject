using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_DiplomProject.Models
{
    [Table("typesupport")]
    public class TypeSupport
    {
        [Key]
        [Column("idtypesupport")]
        public int Idtypesupport { get; set; }

        [Column("type")]
        public string Type { get; set; }
    }
}